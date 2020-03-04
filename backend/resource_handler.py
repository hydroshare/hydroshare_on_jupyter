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
import logging
import glob
import os
import json
import shutil


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
        self.hs = HydroShare(auth=auth, hostname='www.hydroshare.org')
        # Get path to this file's location
        current_path = os.path.dirname(os.path.realpath(__file__))
        self.output_folder = current_path + "/hydroshare_gui/local_hs_resources"
        # Make directory if it doesn't exist
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)
            logging.info("Made {} folder for new resources".format(self.output_folder))

    def get_user_info(self):
        '''Gets information about the user currently logged into HS
        '''
        return self.hs.getUserInfo()

    def delete_resource_JH(self, res_id):
        JH_resource_path = self.output_folder + "/" + res_id
        shutil.rmtree(JH_resource_path)

    def get_local_JH_resources(self):
        '''Gets dictionary of jupyterhub resources by resource id that are
        saved locally.
        '''
        # TODO (Charlie): Make more robust?
        resource_folders = glob.glob(os.path.join(self.output_folder, '*'))
        # TODO: Use a filesystem-independent way of this
        mp_by_res_id = {}
        res_ids = []
        for folder_path in resource_folders:
            res_id = folder_path.split('/')[-1] #TODO: regex
            res_ids.append(res_id)

        return res_ids

    def get_list_of_user_resources(self): # TODO (Vicky): Cache this info
        '''Gets list of all the resources for the logged in user, including
        those stored on hydroshare and those stored locally on jupyterhub
        and information about each one including whether HS ones are stored
        locally.

        Assumes there are no local resources that don't exist in HS
        '''
        resources = {}
        is_local = False # referenced later when checking if res is local

        # Get local res_ids
        local_res_ids = self.get_local_JH_resources()
        # Get the user's resources from HydroShare
        user_hs_resources = self.hs.resources(owner=username)
        for res in user_hs_resources:
            res_id = res['resource_id']
            # check if local
            if res_id in local_res_ids:
                is_local = True

            resources[res_id] = {
                'id': res_id,
                'title': res['resource_title'],
                'hydroShareResource': res, # includes privacy info under 'public'
                'localCopyExists': is_local,
            }

        return list(resources.values())

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
        # TODO: Add type exceptions for resource_title and creators
        # Formatting creators for metadata['metadata']:
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
        resource_id = self.hs.createResource(metadata['rtype'],
                                            metadata['title'],
                                            resource_file=metadata['fpath'],
                                            keywords = metadata['keywords'],
                                            abstract = metadata['abstract'],
                                            metadata = metadata['metadata'],
                                            extra_metadata=metadata['extra_metadata'])

        return resource_id

    def copy_HS_resource(self, og_res_id):
        response = self.hs.resource(og_res_id).copy()
        new_id = response.content.decode("utf-8") # b'id'

        # Change name to 'Copy of []'
        title = self.hs.getScienceMetadata(new_id)['title']
        new_title = "Copy of " + title
        self.hs.updateScienceMetadata(new_id, {"title": new_title})

        return new_id
