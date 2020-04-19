"""
This file sets up the resource handler for working with resources in
HydroShare & JupyterHub.

# TODO: put our full names in these files
Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
"""
#!/usr/bin/python
# -*- coding: utf-8 -*-
import base64
import glob
import logging
import os
import shutil
import json
from dateutil.parser import parse
from getpass import getpass
from pathlib import Path

from hydroshare_jupyter_sync.config_reader_writer import get_config_values, set_config_values
from hs_restclient import HydroShare, HydroShareAuthBasic


class ResourceManager:
    """ Class that defines a handler for working with all of a user's resources.
    This is where they will be able to delete a resource, create a new one, or
    just get the list of a user's resources in hydroshare or jupyterhub.
    """
    def __init__(self):
        """Makes an output folder for storing HS files locally, if none exists,
        and sets up authentication on hydroshare API.
        """
        # authentication for using Hydroshare API
        # TODO: Don't do this every time we create a new instance of this class (very slow)
        # TODO: Move this somewhere else
        auth = HydroShareAuthBasic(username=username, password=password)
        # TODO: Load these with the username and password
        config = get_config_values(['dataPath', 'hydroShareHostname'])
        hostname = 'www.hydroshare.org'
        # TODO: Rename to hydroshare_resource_data
        self.output_folder = Path('local_hs_resources')
        if config:
            hostname = config.get('hydroShareHostname', hostname)
            if 'dataPath' in config:
                self.output_folder = Path(config.get('dataPath'), self.output_folder)
        if not self.output_folder.is_dir():
            # Let any exceptions that occur bubble up
            self.output_folder.mkdir(parents=True)

        self.hs_api_conn = HydroShare(auth=auth, hostname=hostname)

    def save_resource_locally(self, res_id, unzip=True):
        """Saves the HS resource locally, if it does not already exist.
        """
        # Get resource from HS if it doesn't already exist locally
        if not os.path.exists('{}/{}'.format(self.output_folder, res_id)):

            logging.info("Downloading resource from HydroShare...")
            self.hs_api_conn.getResource(res_id, destination=self.output_folder, unzip=unzip)

    def get_user_info(self):
        """Gets information about the user currently logged into HydroShare
        """
        user_info = None
        error = None
        try:
            user_info = self.hs_api_conn.getUserInfo()
        except:
            error = {'type':'InvalidCredentials', 'message':'Invalid username or password'}

        return user_info, error

    def delete_resource_JH(self, res_id):
        error = None
        JH_resource_path = self.output_folder / res_id

        try:
            shutil.rmtree(JH_resource_path)
        except FileNotFoundError:
            error = {'type':'FileNotFoundError', 'message':'Resource does not exist in JupyterHub'}
        except:
            error = {'type':'UnknownError', 'message':'Something went wrong. Could not delete resource.'}
        return error

    def delete_resource_HS(self, res_id):
        error = None
        try:
            self.hs_api_conn.deleteResource(res_id)
        except:
            error = {'type': 'UnknownError', 'message': 'Could not delete resource. Perhaps you don\'t have the authorization.'}
        return error

    def get_local_JH_resources(self):
        """Gets dictionary of jupyterhub resources by resource id that are
        saved locally.
        """
        resource_folders = glob.glob(os.path.join(self.output_folder, '*'))
        # TODO (Emily): Use a filesystem-independent way of this
        mp_by_res_id = {}
        res_ids = []
        for folder_path in resource_folders:
            res_id = folder_path.split('/')[-1] #TODO: regex
            res_ids.append(res_id)

        return res_ids

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
        self.local_res_ids = self.get_local_JH_resources()

        # Get the user's resources from HydroShare
        user_hs_resources = self.hs_api_conn.resources(owner=username)

        try:
            test_generator = list(user_hs_resources) # resources can't be listed if auth fails
        except:
            error = {'type': 'InvalidCredentials', 'message': 'Invalid username or password'}
            return list(resources.values()), error

        for res in test_generator:
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

    def create_HS_resource(self, resource_title, creators, abstract="", privacy="Private"):
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
        if not isinstance(creators, list) or not all(isinstance(creator, str) for creator in creators):
            error = {'type': 'IncorrectType',
                    'message': '"Creators" object should be a list of strings.'}
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
            resource_id = self.hs_api_conn.createResource(metadata['rtype'],
                                                          metadata['title'],
                                                          resource_file=metadata['fpath'],
                                                          keywords = metadata['keywords'],
                                                          abstract = metadata['abstract'],
                                                          metadata = metadata['metadata'],
                                                          extra_metadata=metadata['extra_metadata'])

            self.hs_api_conn.setAccessRules(resource_id, public=public)
        except:
            error = {'type':'UnknownError',
                    'message':'Unable to create resource.'}
        return resource_id, error


    def copy_HS_resource(self, og_res_id):
        # TODO: maybe do some user testing of this & see what ppl expect
        """makes a copy of existing HS resource and links it to an existing local
        resource (we then change the res id on that local resource)"""
        response = self.hs_api_conn.resource(og_res_id).copy()
        new_id = response.content.decode("utf-8") # b'id'

        is_local = og_res_id in self.local_res_ids

        # if a local version exists under the old resource ID, rename it to involve the new one
        if is_local:
            og_path = Path(self.output_folder) / og_res_id / og_res_id
            new_path = Path(self.output_folder) / new_id / new_id
            shutil.move(str(og_path), str(new_path))

        # Change name to 'Copy of []'
        title = self.hs_api_conn.getScienceMetadata(new_id)['title']
        new_title = "Copy of " + title
        self.hs_api_conn.updateScienceMetadata(new_id, {"title": new_title})

        return new_id

    def get_archive_message(self):
        loaded_archive_message = get_config_values(['archiveMessage'])
        if loaded_archive_message and loaded_archive_message['archiveMessage']:
            archive_message = loaded_archive_message['archiveMessage']
        else:
            archive_message = input("Please enter the archive message: ")

            #Save the archive message
            saved_successfully = set_config_values({
                'archiveMessage': archive_message,
            })
            if saved_successfully:
                logging.info('Successfully saved archive message to config file.')
        
        return archive_message


def get_hydroshare_credentials():
    loaded_credentials = get_config_values(['u', 'p'])
    if loaded_credentials and 'u' in loaded_credentials and 'p' in loaded_credentials:
        user_name = loaded_credentials['u']
        pw = base64.b64decode(loaded_credentials['p']).decode('utf-8')
    else:
        user_name = input("Please enter your HydroShare username: ")
        pw = getpass()

        # Save the username and password
        saved_successfully = set_config_values({
            'u': user_name,
            'p': str(base64.b64encode(pw.encode('utf-8')).decode('utf-8')),
        })
        if saved_successfully:
            logging.info('Successfully saved HydroShare credentials to config file.')

    # TODO (Charlie): Check that password works
    return user_name, pw


username, password = get_hydroshare_credentials()
