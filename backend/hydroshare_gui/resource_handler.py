'''
This file sets up the resource handler for working with resources in
hydroshare & jupyterhub.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

from hs_restclient import HydroShare, HydroShareAuthBasic
from metadata_parser import MetadataParser
from login import username, password
import glob
import os


''' Class that defines a handler for working with all of a user's resources.
This is where they will be able to delete a resource, create a new one, or
just get the list of a user's resources in hydroshare or jupyterhub.
'''
class ResourceHandler:

    def __init__(self):
        '''Makes an output folder for storing HS files locally, if none exists,
        and sets up authentication on hydroshare API.
        '''
        # authentication for using Hydroshare API
        auth = HydroShareAuthBasic(username=username, password=password)
        self.hs = HydroShare(auth=auth)
        # Get path to this file's location
        current_path = os.path.dirname(os.path.realpath(__file__))
        self.output_folder = current_path + "/local_hs_resources"
        # Make directory if it doesn't exist
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)
            # TODO (vicky) set up logging system & remove prints
            print("Made {} folder for new resources".format(self.output_folder))

    def get_user_info(self):
        '''Gets information about the user currently logged into HS
        '''
        return self.hs.getUserInfo()

    def get_local_JH_resources(self):
        '''Gets dictionary of jupyterhub resources by resource id that are
        saved locally.
        '''
        resource_folders = glob.glob(os.path.join(self.output_folder, '*'))
        # TODO: Use a filesystem-independent way of this
        mp_by_res_id = {}
        for folder_path in resource_folders:
            res_id = folder_path.split('/')[-1]
            metadata_file_Path = os.path.join(folder_path, res_id, 'data', 'resourcemetadata.xml')
            mp = MetadataParser(metadata_file_Path)
            mp_by_res_id[res_id] = mp

        return mp_by_res_id

    def get_list_of_user_resources(self):
        '''Gets list of all the resources for the logged in user, including
        those stored on hydroshare and those stored locally on jupyterhub
        and information about each one including whether HS ones are stored
        locally.
        '''
        resources = {}

        # Get the user's resources from HydroShare
        user_hs_resources = self.hs.resources(owner=username)
        for res in user_hs_resources:
            res_id = res['resource_id']
            resources[res_id] = {
                'id': res_id,
                'title': res['resource_title'],
                'hydroShareResource': res,
            }

        # Get the resources copied to the local filesystem
        local_resources = self.get_local_JH_resources()
        for res_id, res_metadata in local_resources.items():
            if res_id in resources:
                # TODO: Add local files
                resources[res_id]['localCopyExists'] = True
            else:
                resources[res_id] = {
                    'id': res_id,
                    'title': res_metadata.get_title(),
                    'hydroShareResource': res_metadata.spoof_hs_api_response(),
                    'localCopyExists': True,
                }

        return list(resources.values())
