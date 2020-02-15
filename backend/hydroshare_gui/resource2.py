'''
This file sets up the resource class for getting and updating files &
information associated with a given resource in Jupyterhub & Hydroshare.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

from local_folder import LocalFolder
from remote_folder import RemoteFolder
import logging
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
        self.hs = self.resource_handler.hs

    def save_resource_locally(self, unzip=True):
        '''Saves the HS resource locally, if it does not already exist.
        '''
        # Get resource from HS if it doesn't already exist locally
        if not os.path.exists('{}/{}'.format(self.output_folder, self.res_id)):

            logging.info("getting hs resource")
            self.hs.getResource(self.res_id, destination=self.output_folder, unzip=unzip)
        else:
            logging.info("Resource already exists!")

    def get_files_JH(self):
        '''Gets metadata for all the files currently stored in the JH instance
        of this resource.
        '''

        self.save_resource_locally()
        path_prefix = self.output_folder + "/" + self.res_id + "/" + self.res_id + "/data/contents"
        local_folder = LocalFolder()
        files = local_folder.get_contents_recursive(path_prefix)
        return files

    def get_files_HS(self):
        '''Gets metadata for all the files currently stored in the HS instance
        of this resource.
        '''

        remote_folder = RemoteFolder()
        # get the file information for all files in the HS resource in json
        hs_resource_info = self.hs.resource(self.res_id).files.all().json()
        # figure out what the url prefix to the filepath is
        url_prefix = 'http://www.hydroshare.org/resource/' + self.res_id + '/data/contents'
        folders_dict = {}
        folders_final = []
        nested_files = {}
        # get the needed info for each file
        for file_info in hs_resource_info["results"]:
            # extract filepath from url

            # TODO (kyle/charlie): make this a regex to make it more robust
            filepath = file_info["url"][len(url_prefix)+1:]
            # get proper definition formatting of file if it is a file
            file_definition_hs = remote_folder.get_file_metadata(filepath, file_info["size"])
            # if it is a folder, build up contents
            if not file_definition_hs:
                nested_files[filepath + "/"] = file_info
                folders = filepath.split("/")
                currpath = ""
                for x in range(0, len(folders)-1):
                    folder = folders[x]
                    currpath = currpath + folder + "/"
                    # build up dictionary of folder -> what is in it
                    if (x, folder, currpath) not in folders_dict:
                        folders_dict[(x, folder, currpath)] = []
                    folders_dict[(x, folder, currpath)].append((x+1, folders[x+1], currpath + folders[x+1] + "/"))
            # if it is just a file, add it to the final list
            else:
                folders_final.append(file_definition_hs)

        # go through folders dictionary & build up the nested structure
        i = 0
        for key, val in folders_dict.items():
            # we only want to make the initial call on folders at the top level,
            # (level 0); folders at levels 1, 2, etc. will be built into the
            # result by means of the recursive calls
            if key[0] == 0:
                folder_size, folder_contents = remote_folder.get_contents_recursive(val, folders_dict, nested_files)
                folders_final.append({
                    "name": key[1],
                    "sizeBytes": folder_size,
                    "type": "folder",
                    "contents": folder_contents,
                })

        return folders_final
