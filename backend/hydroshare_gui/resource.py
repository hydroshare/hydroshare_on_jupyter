'''
This file sets up the resource class for getting and updating files &
information associated with a given resource in Jupyterhub & Hydroshare.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

from hs_restclient import HydroShare, HydroShareAuthBasic
from local_folder import LocalFolder
from login import username, password
import os


''' Class that defines a Hydroshare resource & it's associated files that
are local to Jupyterhub.
'''
class Resource:

    def __init__(self, res_id, resource_handler):
        '''Authenticates Hydroshare & sets up class variables.
        '''
        self.res_id = res_id
        self.resource_handler = resource_handler
        self.output_folder = self.resource_handler.output_folder
        # authentication for using Hydroshare API
        auth = HydroShareAuthBasic(username=username, password=password)
        self.hs = HydroShare(auth=auth)

    def save_resource_locally(self, unzip=True):
        '''Saves the HS resource locally, if it does not already exist.
        '''
        # Get resource from HS if it doesn't already exist locally
        if not os.path.exists('{}/{}'.format(self.output_folder, self.resource_id)):

            print("getting hs resource")
            hs.getResource(self.resource_id, destination=self.output_folder, unzip=unzip)
        else:
            print("Resource already exists!")

    def get_files_JH(self):
        '''Gets metadata for all the files currently stored in the JH instance
        of this resource.
        '''

        self.save_resource_locally()
        path_prefix = self.output_folder + "/" + self.res_id + "/" + self.res_id + "/data/contents"
        local_folder = LocalFolder()
        files = local_folder.get_recursive_folder_contents(path_prefix)
        return files
