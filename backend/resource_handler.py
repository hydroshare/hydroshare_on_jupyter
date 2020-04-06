'''
This file sets up the resource handler for working with resources in
# spiffy: can we please make sure we use "HydroShare" and "JupyterHub"?
hydroshare & jupyterhub.

# spiffy: we should probably put our full names in these files
Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

from hs_restclient import HydroShare, HydroShareAuthBasic
from metadata_parser import MetadataParser
from getpass import getpass
from pathlib import Path
import base64

# spiffy: Kyle has the same question. Also maybe we should be reading from a text file using open() instead of importing...
# SPIFFY (Vicky) probably a good section to talk about cause it's funky..
# TODO: (Charlie's question) Why is this in this class, vs hs_server?
# Prompt for username and password if not already saved
try:
    from login import username, password
    password = base64.b64decode(password.decode("utf-8"))
except ModuleNotFoundError:
    username = input("Hydroshare Username: ")
    password = getpass()
    pw = (base64.b64encode(password.encode("utf-8")))

    # TODO (Charlie): Check that password works

    folder = Path(__file__).parent.absolute()

    f = open(folder / "login.py", "w+")
    f.write("username = \"" + username + "\"\n")
    f.write("password = " + str(pw) + "\n")
    f.close()

# Check that user and password are valid


import logging
import glob
import os
import json
import shutil

# spiffy: block comments should be triple " not triple ' and placed after class/def line (per PEP style guide)
''' Class that defines a handler for working with all of a user's resources.
This is where they will be able to delete a resource, create a new one, or
just get the list of a user's resources in hydroshare or jupyterhub.
'''
class ResourceHandler:

    def __init__(self):
        # spiffy: block comments should be triple " not triple ' (per PEP style guide)
        '''Makes an output folder for storing HS files locally, if none exists,
        and sets up authentication on hydroshare API.
        '''
        # authentication for using Hydroshare API
        auth = HydroShareAuthBasic(username=username, password=password)
        # spiffy: do we want to allow specifying the hostname as a parameter? This is potentially useful if people are
        # running this on their own computers & HS instances
        self.hs = HydroShare(auth=auth, hostname='www.hydroshare.org')
        # Get path to this file's location
        # spiffy: you could also do self.output_folder = None and then check if it's still None later
        path_set = False
        # spiffy: should be "is not None"
        # spiffy: also, we may want to call it something that doesn't presume they're using JupyterHub. Once we figure
        # out what we're calling this thing, maybe <name>_DATA_PATH? Like HS_SYNC_DATA_PATH
        if os.getenv("JH_FOLDER_PATH") != None:
            self.output_folder = os.environ.get("JH_FOLDER_PATH")
            path_set = True
            if not os.path.exists(self.output_folder):
                # spiffy: prefer not using "JH" (maybe just "Invalid data path specified. Could not find directory."
                print("Invalid JH folder path set, path does not exist.")
                # spiffy: then set self.output_folder back to None
                path_set = False
        if not path_set:
            current_path = os.path.dirname(os.path.realpath(__file__))
            self.output_folder = current_path + "/hydroshare_gui/local_hs_resources"
            # spiffy: prefer not using "JH"
            print("No valid JH folder path set, using default: " + self.output_folder)
            print("To set a different JH folder path, please set the JH_FOLDER_PATH environment variable.")
            # Make directory if it doesn't exist
            if not os.path.exists(self.output_folder):
                os.makedirs(self.output_folder)
                logging.info("Made {} folder for new resources".format(self.output_folder))

    def get_user_info(self):
        # spiffy: probably should not abbreviate HydroShare in docstrings
        '''Gets information about the user currently logged into HS
        '''
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
        '''Gets dictionary of jupyterhub resources by resource id that are
        saved locally.
        '''
        resource_folders = glob.glob(os.path.join(self.output_folder, '*'))
        # TODO (Emily): Use a filesystem-independent way of this
        mp_by_res_id = {}
        res_ids = []
        for folder_path in resource_folders:
            res_id = folder_path.split('/')[-1] #TODO: regex
            res_ids.append(res_id)

        return res_ids

    def get_list_of_user_resources(self):
        '''Gets list of all the resources for the logged in user, including
        those stored on hydroshare and those stored locally on jupyterhub
        and information about each one including whether HS ones are stored
        locally.

        Assumes there are no local resources that don't exist in HS
        '''
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
            # spiffy: should be whitespaces after all colons in strings (per PEP8 -- a linter helps with reminders)
            error = {'type':'IncorrectType',
                    'msg':'Resource title should be a string.'}
            return resource_id, error
        if not isinstance(creators, list) or not all(isinstance(creator, str) for creator in creators):
            error = {'type':'IncorrectType',
                    'msg':'"Creators" object should be a list of strings.'}
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

    # spiffy: can we please get a docstring explaining what this function does?
    def copy_HS_resource(self, og_res_id):
        response = self.hs.resource(og_res_id).copy()
        new_id = response.content.decode("utf-8") # b'id'

        # TODO: before doing this should we rename any existing local version to have the new ID??
        # SPIFFY (Emily) is_local is never used, so are these necessary?
        # spiffy; is_local = new_id in self.local_res_ids also works (but do we even need is_local?)
        if new_id in self.local_res_ids:
            is_local = True
        else:
            is_local = False

        # Change name to 'Copy of []'
        title = self.hs.getScienceMetadata(new_id)['title']
        new_title = "Copy of " + title
        self.hs.updateScienceMetadata(new_id, {"title": new_title})

        return new_id
