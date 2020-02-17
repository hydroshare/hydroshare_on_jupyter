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
import os
from os import path


''' Class that defines a Hydroshare resource & it's associated files that
are local to Jupyterhub.
'''
class Resource:

    def __init__(self, res_id, resource_handler):
        '''Authenticates Hydroshare & sets up class variables.
        '''
        self.res_id = res_id
        self.remote_folder = RemoteFolder(self.res_id)
        self.resource_handler = resource_handler
        self.output_folder = self.resource_handler.output_folder
        self.hs = self.resource_handler.hs
        self.path_prefix = self.output_folder + "/" + self.res_id + "/" + self.res_id + "/data/contents/"
        self.hs_files = self.get_files_upon_init_HS()
        

    def save_resource_locally(self, unzip=True):
        '''Saves the HS resource locally, if it does not already exist.
        '''
        # Get resource from HS if it doesn't already exist locally
        if not os.path.exists('{}/{}'.format(self.output_folder, self.res_id)):

            print("getting hs resource")
            self.hs.getResource(self.res_id, destination=self.output_folder, unzip=unzip)
        else:
            print("Resource already exists!")

    def get_files_JH(self):
        '''Gets metadata for all the files currently stored in the JH instance
        of this resource.
        '''

        self.save_resource_locally()
        local_folder = LocalFolder()
        files = local_folder.get_contents_recursive(self.path_prefix)
        return files

    def get_files_HS(self):
        return self.hs_files

    def get_files_upon_init_HS(self):
        '''Gets metadata for all the files currently stored in the HS instance
        of this resource.
        '''

        # get the file information for all files in the HS resource in json
        # TODO (vicky) rename array to be more descriptive
        array = self.hs.resource(self.res_id).files.all().json()
        # figure out what the url prefix to the filepath is
        url_prefix = 'http://www.hydroshare.org/resource/' + self.res_id + '/data/contents'
        folders_dict = {}
        folders_final = []
        nested_files = {}
        # get the needed info for each file
        for file_info in array["results"]:
            # extract filepath from url

            # TODO (kyle/charlie): make this a regex to make it more robust
            filepath = file_info["url"][len(url_prefix)+1:]
            # get proper definition formatting of file if it is a file
            file_definition_hs = self.remote_folder.get_file_metadata(filepath, file_info["size"])
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
            # TODO (vicky): add comment about what this is doing
            if key[0] == 0:
                folder_size, folder_contents = self.remote_folder.get_contents_recursive(val, folders_dict, nested_files)
                folders_final.append({
                    "name": key[1],
                    "sizeBytes": folder_size,
                    "type": "folder",
                    "contents": folder_contents,
                })

        return folders_final

    def delete_file_or_folder_from_JH(self, filepath):
        local_folder = LocalFolder()

        if "." not in filepath:
            local_folder.delete_folder(self.path_prefix+filepath)
            self.is_JH_folder_empty(self.path_prefix+filepath.split('/', 1)[0])
        else:
            local_folder.delete_file(self.path_prefix+filepath)
            self.is_JH_folder_empty(self.path_prefix+filepath.split('/', 1)[0])

    def delete_file_or_folder_from_HS(self,filepath):
        if "." not in filepath:
            self.remote_folder.delete_folder(filepath+"/")
        else:
            self.remote_folder.delete_file(filepath)

    def delete_JH_folder_if_empty(self, filepath):
        if not os.listdir(filepath):
            self.delete_file_or_folder_from_JH(self, filepath)

    def delete_HS_folder_if_empty(self, filepath):
        splitPath = filepath.split('/')
        parentDict = self.hs_files
        for directory in splitPath:
            if directory in parentDict:
                parentDict = parentDict[directory]
            else:
                return False
        
        return True
        if not os.listdir(filepath):
            self.delete_file_or_folder_from_HS(self, filepath)

    def is_file_in_JH(self, filepath):
        return path.exists(self.path_prefix+filepath)

    def is_file_in_HS(self, filepath):
        splitPath = filepath.split('/')
        parentDict = self.hs_files
        i = 0
        while i < len(splitPath):
            j = 0
            while j < len(parentDict):
                if parentDict[j]["name"] == splitPath[i]:
                    if parentDict[j]["type"] == "folder":
                        parentDict = parentDict[j]["contents"]
                        break
                    else:
                        return True
                j += 1
            i += 1
        
        return False

    def is_folder_in_HS(self, folderpath):
        splitPath = folderpath.split('/')
        parentDict = self.hs_files
        i = 0
        while i < len(splitPath):
            j = 0
            found = False
            while j < len(parentDict):
                if parentDict[j]["name"] == splitPath[i]:
                    if parentDict[j]["type"] == "folder":
                        parentDict = parentDict[j]["contents"]
                        found = True
                        break
                j += 1
            if found == False:
                return False
            i += 1
        
        return True


    def overwrite_JH_with_file_from_HS(self, filepath):
        if self.is_file_in_JH(filepath):
            self.delete_file_or_folder_from_JH(filepath)
        elif "/" in filepath:
            outputPath = filepath.rsplit('/', 1)[0] + "/"
            if not os.path.exists(outputPath):
                os.makedirs(outputPath)
        self.remote_folder.download_file_to_JH(self.res_id, filepath, self.path_prefix)   

    def overwrite_HS_with_file_from_JH(self, filepath):
        if self.is_file_in_HS(filepath):
            self.delete_file_or_folder_from_HS(filepath)
        elif "/" in filepath:
            folderPath = filepath.rsplit('/', 1)[0]
            if self.is_folder_in_HS(folderPath):
                self.remote_folder.create_folder(folderPath)

        self.remote_folder.upload_file_to_HS(self.path_prefix+filepath, filepath)  

