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
import json
import logging
import os
import shutil
from getpass import getpass
from pathlib import Path

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
        auth = HydroShareAuthBasic(username=username, password=password)
        # TODO (Vicky): specify hostname as a parameter to this function
        self.hs = HydroShare(auth=auth, hostname='www.hydroshare.org')
        # Get path to this file's location
        self.output_folder = None
        # TODO: also, we may want to call it something that doesn't presume they're using JupyterHub. Once we figure
        # out what we're calling this thing, maybe <name>_DATA_PATH? Like HS_SYNC_DATA_PATH
        # TODO: get this from a project config file that is read once, maybe same as un/pw one
        if os.getenv("JH_FOLDER_PATH") is not None:
            self.output_folder = os.environ.get("JH_FOLDER_PATH")
            if not os.path.exists(self.output_folder):
                # TODO: when you change env name, also make this msg not JH specific
                print("Invalid JH folder path set, path does not exist.")
                self.output_folder = None
        if self.output_folder is None:
            current_path = os.path.dirname(os.path.realpath(__file__))
            self.output_folder = current_path + "/local_hs_resources"
            # TODO: get rid of "JH" reference
            print("No valid JH folder path set, using default: " + self.output_folder)
            print("To set a different JH folder path, please set the JH_FOLDER_PATH environment variable.")
            # Make directory if it doesn't exist
            if not os.path.exists(self.output_folder):
                os.makedirs(self.output_folder)
                logging.info("Made {} folder for new resources".format(self.output_folder))

    def get_user_info(self):
        """Gets information about the user currently logged into HydroShare
        """
        user_info = None
        error = None
        try:
            user_info = self.hs.getUserInfo()
        except:
            error = {'type':'InvalidCredentials', 'msg':'Invalid username or password'}

        return user_info, error

    def delete_resource_JH(self, res_id):
        error = None
        JH_resource_path = self.output_folder + "/" + res_id

        try:
            shutil.rmtree(JH_resource_path)
        except FileNotFoundError:
            error = {'type':'FileNotFoundError', 'msg':'Resource does not exist in JupyterHub'}
        except:
            error = {'type':'UnknownError', 'msg':'Something went wrong. Could not delete resource.'}
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
        is_local = False # referenced later when checking if res is local

        # Get local res_ids
        self.local_res_ids = self.get_local_JH_resources()

        # Get the user's resources from HydroShare
        user_hs_resources = self.hs.resources(owner=username)

        try:
            test_generator = list(user_hs_resources) # resources can't be listed if auth fails
        except:
            error = {'type': 'InvalidCredentials', 'msg': 'Invalid username or password'}
            return list(resources.values()), error

        for res in test_generator:
            res_id = res['resource_id']

            # check if local
            if res_id in self.local_res_ids:
                is_local = True

            resources[res_id] = {
                'id': res_id,
                'title': res['resource_title'],
                'hydroShareResource': res, # includes privacy info under 'public'
                'localCopyExists': is_local,
            }

        return list(resources.values()), error

    # spiffy: do we need to include HS in the function name?
    def create_HS_resource(self, resource_title, creators):
        """
        Creates a hydroshare resource from the metadata specified in a dict

        The metadata should be given in the format:
        {'abstract': '',
        'title': '',
        'keywords': (),
        'rtype': 'GenericResource',
        'fpath': '',
        'metadata': '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"Charlie"}}]',
        'extra_metadata': ''}

        Example with information:
        {'abstract': 'My abstract',
        'title': 'My resource',
        'keywords': ('my keyword 1', 'my keyword 2'),
        'rtype': 'GenericResource',
        'fpath': 'test_delete.md',
        'metadata': '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"Charlie"}}, {"creator":{"name":"Charlie2"}}]',
        'extra_metadata': '{"key-1": "value-1", "key-2": "value-2"}'}
        """
        error = None
        resource_id = None

        # Type errors for resource_title and creators
        if not isinstance(resource_title, str):
            error = {'type': 'IncorrectType',
                    'msg': 'Resource title should be a string.'}
            return resource_id, error
        if not isinstance(creators, list) or not all(isinstance(creator, str) for creator in creators):
            error = {'type': 'IncorrectType',
                    'msg': '"Creators" object should be a list of strings.'}
            return resource_id, error

        # Formatting creators for metadata['metadata']:
        # spiffy: should these dates really be hardcoded?
        # spiffy: also, it'd probably make errors less likely to crop up if this was a dictionary that was turned into JSON using the json module
        meta_metadata = '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}'
        for creator in creators:
            creator_string = ', {"creator":{"name":"'+creator+'"}}'
            meta_metadata = meta_metadata + creator_string
        meta_metadata = meta_metadata + ']'

        metadata = {'abstract': '',
                    'title': resource_title,
                    'keywords': (),
                    'rtype': 'GenericResource',
                    'fpath': '',
                    'metadata': meta_metadata,
                    'extra_metadata': ''}

        resource_id = ''
        try:
            resource_id = self.hs.createResource(metadata['rtype'],
                                            metadata['title'],
                                            resource_file=metadata['fpath'],
                                            keywords = metadata['keywords'],
                                            abstract = metadata['abstract'],
                                            metadata = metadata['metadata'],
                                            extra_metadata=metadata['extra_metadata'])
        except:
            error = {'type':'UnknownError',
                    'msg':'Unable to create resource.'}
        return resource_id, error


    def copy_HS_resource(self, og_res_id):
        # TODO: maybe do some user testing of this & see what ppl expect
        """makes a copy of existing HS resource and links it to an existing local
        resource (we then change the res id on that local resource)"""
        response = self.hs.resource(og_res_id).copy()
        new_id = response.content.decode("utf-8") # b'id'

        is_local = og_res_id in self.local_res_ids

        # if a local version exists under the old resource ID, rename it to involve the new one
        if is_local:
            og_path = Path(self.output_folder) / og_res_id / og_res_id
            new_path = Path(self.output_folder) / new_id / new_id
            shutil.move(str(og_path), str(new_path))

        # Change name to 'Copy of []'
        title = self.hs.getScienceMetadata(new_id)['title']
        new_title = "Copy of " + title
        self.hs.updateScienceMetadata(new_id, {"title": new_title})

        return new_id


def get_hydroshare_credentials():
    username = None
    password = None
    # Attempt to read the config file from ~/.config/hydroshare_jupyter_sync/config.json
    config_path = Path.home() / '.config' / 'hydroshare_jupyter_sync' / 'config.json'
    if config_path.is_file():
        try:
            # Read from the file
            with open(str(config_path), 'r') as f:
                try:
                    config = json.load(f)
                    # Extract the user's HydroShare username and password
                    username = config.get('u')
                    password = config.get('p')
                    if password:
                        password = base64.b64decode(password).decode('utf-8')
                    if username and password:
                        logging.info('Successfully loaded HydroShare credentials from ' + str(config_path))
                except json.JSONDecodeError:
                    pass
        except IOError:
            logging.error('Found existing config file in ' + str(config_path) + ' but could not open it.')
            return None, None

    if username is None or password is None:
        username = input("Please enter your HydroShare username: ")
        password = getpass()

        # Save the username and password
        if not config_path.exists():
            # Create the parent directory if it doesn't exist
            if not config_path.parent.exists():
                config_path.parent.mkdir(parents=True)
        elif not config_path.is_file():  # A folder perhaps?
            logging.error(str(config_path) + ' exists but is not a file.')
            return None, None

        # Read from the file
        try:
            with open(str(config_path), 'w+') as f:
                if f:
                    try:
                        config = json.load(f)
                    except json.JSONDecodeError:
                        config = {}
                else:
                    config = {}
                config['u'] = username
                config['p'] = str(base64.b64encode(password.encode('utf-8')).decode('utf-8'))
                json.dump(config, f)
            logging.info('Successfully saved HydroShare credentials to ' + str(config_path))
        except IOError:
            logging.error('Could not write to config file ' + str(config_path))
            return None, None

    # TODO (Charlie): Check that password works
    return username, password


username, password = get_hydroshare_credentials()
