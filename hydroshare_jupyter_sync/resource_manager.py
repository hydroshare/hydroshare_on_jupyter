"""
This file sets up the resource handler for working with resources in
HydroShare & JupyterHub.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# !/usr/bin/python
# -*- coding: utf-8 -*-
import base64
import logging
import shutil
import json
from pathlib import Path

from hydroshare_jupyter_sync.config_reader_writer import (get_config_values,
                                                          set_config_values)
from hs_restclient import HydroShare, HydroShareAuthBasic
from hs_restclient.exceptions import HydroShareHTTPException

HYDROSHARE_AUTHENTICATION_ERROR = {
    'type': 'HydroShareAuthenticationError',
    'message': 'Invalid HydroShare username or password.',
}


class ResourceManager:
    """ Class that defines a handler for working with all of a user's resources.
    This is where they will be able to delete a resource, create a new one, or
    just get the list of a user's resources in hydroshare or jupyterhub.
    """
    def __init__(self):
        """Makes an output folder for storing HS files locally, if none exists,
        and sets up authentication on hydroshare API.
        """
        config = get_config_values(['dataPath', 'hydroShareHostname'])
        self.hs_hostname = 'www.hydroshare.org'
        # TODO: Rename to hydroshare_resource_data
        self.output_folder = Path('local_hs_resources')
        if config:
            if 'hydroShareHostname' in config:
                self.hs_hostname = config['hydroShareHostname']
            if 'dataPath' in config:
                self.output_folder = Path(config['dataPath'])
        if not self.output_folder.is_dir():
            # Let any exceptions that occur bubble up
            self.output_folder.mkdir(parents=True)

        self.hs_api_conn = None  # Use 'authenticate' to initialize
        self.username = None
        self._archive_message = None

    def authenticate(self, username=None, password=None, save=False):
        """ Attempts to authenticate with HydroShare.

        :param username: the user's HydroShare username
        :type username: str
        :param password: the user's HydroShare password
        :type password: str
        :param save: whether or not to save the credentials to the config
        file if the authentication succeeds
        :type save: bool
        :return: the user's information (name, email, etc) from HydroShare if
        successful, None otherwise
        """
        if not username or not password:
            # Check the config file for a username and password
            config = get_config_values(['u', 'p'])
            if not config or 'u' not in config or 'p' not in config:
                # No passed credentials and no saved credentials --
                # can't authenticate
                return None
            username = config['u']
            password = base64.b64decode(config['p']).decode('utf-8')

        # Try to authenticate
        auth = HydroShareAuthBasic(username=username, password=password)
        self.hs_api_conn = HydroShare(auth=auth, hostname=self.hs_hostname)
        try:
            user_info = self.hs_api_conn.getUserInfo()
            self.username = user_info.get('username')
        except HydroShareHTTPException as e:
            if e.status_code == 401:  # Unauthorized
                return None  # Authentication failed
            raise e  # Some other error -- bubble it up

        # Authentication succeeded
        if save:
            # Save the username and password
            saved_successfully = set_config_values({
                'u': username,
                'p': str(base64.b64encode(password.encode('utf-8')).decode(
                                                                    'utf-8')),
            })
            if saved_successfully:
                logging.info('Successfully saved HydroShare credentials to '
                             'config file.')

        return user_info  # Authenticated successfully

    def is_authenticated(self):
        if self.hs_api_conn is None:
            self.authenticate()
        return self.hs_api_conn is not None

    def save_resource_locally(self, res_id):
        """ Downloads a resource to the local filesystem if a copy does
            not already exist locally

            :param res_id: the resource ID
            :type res_id: str
        """
        # Get resource from HS if it doesn't already exist locally
        if not (self.output_folder / res_id).exists():
            logging.info(f"Downloading resource {res_id} from HydroShare...")
            self.hs_api_conn.getResource(res_id,
                                         destination=self.output_folder,
                                         unzip=True)

    def get_user_info(self):
        """Gets information about the user currently logged into HydroShare
        """
        user_info = None
        error = None
        try:
            user_info = self.hs_api_conn.getUserInfo()
        except HydroShareHTTPException as e:
            if e.status_code == 401:  # Unauthorized
                error = HYDROSHARE_AUTHENTICATION_ERROR
            else:
                error = {
                    'type': 'GenericHydroShareHTTPException',
                    'message': e.status_msg,
                }

        return user_info, error

    def delete_resource_locally(self, res_id):
        """ Attempts to delete the local copy of the resource files from the
            disk

            :param res_id: the ID of the resource to delete
            :type res_id: str
         """
        resource_path = self.output_folder / res_id
        if not resource_path.exists():
            return {
                'type': 'FileNotFoundError',
                'message': (f'Could not find a local copy of resource {res_id}'
                            ' to delete.'),
            }
        try:
            shutil.rmtree(str(resource_path))
        except IOError:
            return {
                'type': 'IOError',
                'message': (f'Something went wrong. Could not delete'
                            f' resourc {res_id}.'),
            }
        return None  # No error

    def delete_resource_from_hs(self, res_id):
        try:
            self.hs_api_conn.deleteResource(res_id)
        except HydroShareHTTPException as e:
            return {
                'type': 'GenericHydroShareHTTPException',
                'message': e.status_msg,
            }
        return None  # No error

    def get_local_resource_ids(self):
        """ Gets a list of IDs of all the resources saved locally

            :return a set of strings containing all of the resource IDs
            :rtype set<str>
         """
        return set(map(lambda p: p.name, self.output_folder.glob('*')))

    def get_list_of_user_resources(self):
        # TODO: speed this up
        """Gets list of all the resources for the logged in user, including
        those stored on hydroshare and those stored locally on jupyterhub
        and information about each one including whether HS ones are stored
        locally.

        Assumes there are no local resources that don't exist in HS
        """
        error = None

        resources = {}

        # Get local res_ids
        self.local_res_ids = self.get_local_resource_ids()

        # Get the user's resources from HydroShare
        user_hs_resources = self.hs_api_conn.resources(owner=self.username)

        try:
            # Resources can't be listed if auth fails
            hs_resources = list(user_hs_resources)
        except AttributeError:
            return None, HYDROSHARE_AUTHENTICATION_ERROR

        for res in hs_resources:
            res_id = res['resource_id']

            resources[res_id] = {
                'abstract': res.get('abstract'),
                'authors': res.get('authors'),
                'creator': res.get('creator'),
                'created': res.get('date_created'),
                'lastUpdated': res.get('date_last_updated'),
                'localCopyExists': res_id in self.local_res_ids,
                'localFiles': res.get('localFiles'),
                'id': res_id,
                'isPublic': res.get('public'),
                'published': res.get('published'),
                'status': res.get('status'),
                'title': res.get('resource_title'),
                'url': res.get('resource_url'),
            }

        return list(resources.values()), error

    def create_HS_resource(self, resource_title, creators, abstract="",
                           privacy="Private"):
        """
        Creates a hydroshare resource from the metadata specified in a dict
        using the given resource_title and specified creators

        """
        error = None
        resource_id = None

        # Type errors for resource_title and creators
        if not isinstance(resource_title, str):
            error = {'type': 'IncorrectType',
                     'message': 'Resource title should be a string.'}
            return resource_id, error
        if (not isinstance(creators, list) or
            not all(isinstance(creator, str)
                    for creator in creators)):
            error = {'type': 'IncorrectType',
                     'message': '"Creators" object should be a '
                     'list of strings.'}
            return resource_id, error

        if abstract is None:
            abstract = ""

        if privacy == "Public":
            public = True
        else:
            public = False

        meta_metadata = []

        for creator in creators:
            meta_metadata.append({"creator": {"name": creator}})
        meta_metadata = json.dumps(meta_metadata)

        metadata = {'abstract': abstract,
                    'title': resource_title,
                    'keywords': (),
                    'rtype': 'GenericResource',
                    'fpath': '',
                    'metadata': meta_metadata,
                    'extra_metadata': ''}

        resource_id = ''
        try:
            resource_id = (
                self.hs_api_conn.createResource(
                                     metadata['rtype'],
                                     metadata['title'],
                                     resource_file=metadata['fpath'],
                                     keywords=metadata['keywords'],
                                     abstract=metadata['abstract'],
                                     metadata=metadata['metadata'],
                                     extra_metadata=metadata[
                                                        'extra_metadata']))

            self.hs_api_conn.setAccessRules(resource_id, public=public)
        except Exception:
            error = {'type': 'UnknownError',
                     'message': 'Unable to create resource.'}
        return resource_id, error

    def create_copy_of_resource_in_hs(self, src_res_id):
        """ Makes a copy of a resource in HydroShare and updates the local copy
            of the old resource to point to the new copy.

            :param src_res_id: the ID of the resource in HydroShare to
            duplicate
            :type src_res_id: str
            :returns the new resource ID
        """
        response = self.hs_api_conn.resource(src_res_id).copy()
        new_id = response.content.decode("utf-8")  # b'id'

        is_local = src_res_id in self.local_res_ids

        # if a local version exists under the old resource ID, rename it to
        # point to the new one
        if is_local:
            og_path = self.output_folder / src_res_id / src_res_id
            new_path = self.output_folder / new_id / new_id
            shutil.move(str(og_path), str(new_path))

        # Change name to 'Copy of []'
        title = self.hs_api_conn.getScienceMetadata(new_id)['title']
        new_title = "Copy of " + title
        self.hs_api_conn.updateScienceMetadata(new_id, {"title": new_title})

        return new_id

    def get_archive_message(self):
        """ Gets the message to display on the resource page prompting the user
            to archive their resources to HydroShare
         """
        if not self._archive_message:
            config = get_config_values(['archiveMessage'])
            if config:
                self._archive_message = config.get('archiveMessage')
        return self._archive_message
