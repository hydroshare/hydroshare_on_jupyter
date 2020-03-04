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
from os import path
import dateutil.parser # for parsing resource times
import re
import pathlib
import hs_restclient
from pathlib import *
import shutil

HS_PREFIX = 'hs'
JH_PREFIX = 'local'


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

        self.remote_folder = RemoteFolder(self.hs, self.res_id)
        self.local_folder = LocalFolder()

        self.path_prefix = Path(self.output_folder) / self.res_id / self.res_id / 'data' / 'contents'
        self.hs_files = self.get_files_upon_init_HS()
        self.JH_files = self.get_files_upon_init_JH()


    def create_file_JH(self, filename):
        '''Creates a new file with the given name in JH
        '''
        if filename is not None:
            with open(self.path_prefix + filename, "w") as fp:
                # if you wanted you could write to the file here, but we just want to create it
                pass


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
        return self.JH_files

    def get_files_upon_init_JH(self):
        '''Gets metadata for all the files currently stored in the JH instance
        of this resource.
        '''

        self.save_resource_locally()
        resource_files_root_path = Path(self.path_prefix)
        if not resource_files_root_path.exists():
            resource_files_root_path.mkdir(parents=True)
        files = self.local_folder.get_contents_recursive(self.path_prefix, resource_files_root_path, JH_PREFIX+':')
        root_dir = {
            "name": "",
            "path": JH_PREFIX + ":/",
            "sizeBytes": resource_files_root_path.stat().st_size,
            "type": "folder",
            "contents": files,
        }
        return root_dir

    def update_hs_files(self):
        self.hs_files = self.get_files_upon_init_HS()

    def get_files_HS(self):
        return self.hs_files

    def get_files_upon_init_HS(self):
        '''Gets metadata for all the files currently stored in the HS instance
        of this resource.
        '''

        # get the file information for all files in the HS resource in json
        hs_resource_info = self.hs.resource(self.res_id).files.all().json()
        url_prefix = 'http://www.hydroshare.org/resource/' + self.res_id + '/data/contents'
        folders_dict = {}
        folders_final = []
        nested_files = {}
        # get the needed info for each file
        for file_info in hs_resource_info["results"]:
            # extract filepath from url
            filepath = file_info["url"][len(url_prefix)+1:]
            # get proper definition formatting of file if it is a file
            file_definition_hs = self.remote_folder.get_file_metadata(filepath, filepath, file_info["size"],
                                                                      HS_PREFIX+':')
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
                folder_size, folder_contents = self.remote_folder.get_contents_recursive(val, folders_dict,
                                                                                         nested_files, HS_PREFIX+':')
                folders_final.append({
                    "name": key[1],
                    "path": HS_PREFIX + ':/' + key[2].strip('/'),
                    "sizeBytes": folder_size,
                    "type": "folder",
                    "contents": folder_contents,
                })

        rootsize = 0
        for f in folders_final:
            rootsize += (f["sizeBytes"])

        root_dir = {
            "name": "",
            "path": HS_PREFIX + ":/",
            "sizeBytes": rootsize,
            "type": "folder",
            "contents": folders_final,
        }

        return root_dir

    def rename_or_move_file_HS(self, old_filepath, new_filepath):
        '''Renames the hydroshare version of the file from old_filename to
        new_filename.
        '''
        if old_filepath is not None and new_filepath is not None:
            pathWithoutType, fileType = old_filepath.split(".")
            if self.is_file_in_HS(pathWithoutType, fileType):
                self.remote_folder.rename_or_move_file(old_filepath, new_filepath)
                folderpath, filename = old_filepath.rsplit("/", 1)
                self.delete_HS_folder_if_empty(folderpath, filename)
            else:
                logging.info('Trying to rename or move file that does not exist: ' + old_filepath)
        else:
            logging.info('Missing inputs for old and new filepath')

    def rename_or_move_file_JH(self, old_filepath, new_filepath):
        """Renames the jupyterhub version of the file from old_filename to
        new_filename.
        """
        if old_filepath is not None and new_filepath is not None:
            src_full_path = self.path_prefix / old_filepath
            dest_full_path = self.path_prefix / new_filepath
            if src_full_path.exists():
                shutil.move(str(src_full_path), str(dest_full_path))
                self.delete_JH_folder_if_empty(src_full_path.parent)
            else:
                logging.info('Trying to rename or move file that does not exist: ' + old_filepath)
        else:
            logging.info('Missing inputs for old and new filepath')

    def delete_file_or_folder_from_JH(self, filepath):
        """ Deletes a file or folder from the local filesystem.
            :param filepath the full path to the file or folder on the local filesystem
            :type filepath str | PosixPath
        """
        if isinstance(filepath, str):
            filepath = Path(filepath)

        if filepath.is_dir():
            self.local_folder.delete_folder(filepath)

            # check if after deleting this folder, the parent directory is empty
            # if so this will delete that parent directory
            # TODO: Do we really want to do this?
            if filepath.parent != self.path_prefix:
                self.delete_JH_folder_if_empty(filepath.parent)
        else:
            self.local_folder.delete_file(self.path_prefix+filepath)

            # check if after deleting this file, the parent directory is empty
            # if so this will delete that parent directory
            if "/" in filepath:
                self.delete_JH_folder_if_empty(filepath.rsplit('/', 1)[0])

    def delete_JH_folder_if_empty(self, filepath):
        """ deletes JH folder if it is empty
        calls delete_file_or_folder_from JH to check if
        parent directory needs to be deleted """

        if len(list((self.path_prefix / filepath).iterdir())) == 0:
            self.delete_file_or_folder_from_JH(filepath)

    def is_file_or_folder_in_JH(self, filepath):
        """ is a file in JH """
        return path.isfile(filepath)

    def delete_file_or_folder_from_HS(self, filepath):
        """ deletes file or folder from HS """
        # if file path does not contain file (ie: we want to delete folder)
        if not isinstance(filepath, PosixPath):
            filepath = Path(filepath)
        # FIXME: This will not work if the directory has a . in it (which is valid in UNIX)
        # Check if there is a suffix/extension (indicating we're deleting a folder)
        if filepath.suffix:
            self.remote_folder.delete_folder(str(filepath)+"/")
            # check if after deleting this folder, the parent directory is empty
            # if so this will delete that parent directory
            # TODO: Delete this or make it recursive and use pathlib
            # if "/" in filepath:
            #     self.delete_HS_folder_if_empty(filepath.split('/', 1)[0], filepath.rsplit('/', 1)[1])
        else:
            self.remote_folder.delete_file(filepath)
            # check if after deleting this file, the parent directory is empty
            # if so this will delete that parent directory
            if "/" in filepath:
                self.delete_HS_folder_if_empty(filepath.rsplit('/', 1)[0], filepath.rsplit('/', 1)[1].split(".")[0])

    def delete_HS_folder_if_empty(self, folderpath, acceptable_name):
        """ deletes folder from HS if it is empty
        this can only be used with hs_files as the HydroShare API does not give us empty
        folders when giving us files. This function should only be used if a recent
        action could have caused a folder to be empty """
        splitPath = ["/"]
        splitPath += folderpath.split('/')
        parentDict = self.hs_files
        for directory in splitPath:
            i = 0
            while i < len(parentDict):
                if parentDict[i]["name"] == directory:
                    parentDict = parentDict[i]["contents"]
                    break
                i += 1

        j = 0
        for i in range(len(parentDict)):
            if parentDict[i]["name"] != acceptable_name:
                j += 1
        if j == 0:
            self.delete_file_or_folder_from_HS(folderpath)

    def is_file_or_folder_in_HS(self, item_path, file_extension=None):
        """ Checks if a file or folder exists in a HydroShare resource
            :param item_path the name (sans extension) of the file or folder
            :param file_extension if a file, the extension of that file
         """
        if not isinstance(item_path, PosixPath):
            item_path = Path(item_path)
        current_dir_contents = self.hs_files.get('contents')
        for current_path_part in item_path.parts:
            found_next_part = False
            for file_or_folder in current_dir_contents:
                if file_or_folder["name"] == current_path_part:
                    if file_or_folder["type"] == "folder":
                        current_dir_contents = file_or_folder.get('contents')
                        found_next_part = True
                        break
                    elif file_extension is not None and file_or_folder["type"] == file_extension:
                        return True
            if not found_next_part:
                return False

        return False


    def overwrite_JH_with_file_from_HS(self, filepath):
        """ overwrites JH file with one from HS """
        if self.is_file_or_folder_in_JH(filepath):
            self.delete_file_or_folder_from_JH(filepath)
        if "/" in filepath:
            outputPath = filepath.rsplit('/', 1)[0]
            if self.is_file_or_folder_in_JH(outputPath) == False:
                os.makedirs(self.path_prefix + outputPath + "/")
        self.remote_folder.download_file_to_JH(filepath, self.path_prefix)
        self.JH_files = self.get_files_upon_init_JH()

    def overwrite_HS_with_file_from_JH(self, file_path):
        """ overwrites HS file with one from JH """
        if str(file_path).startswith('/'):
            file_path = str(file_path)[1:]
        full_file_path_rel_resource_root = Path(file_path)
        file_extension = full_file_path_rel_resource_root.suffix
        path_without_extension = str(full_file_path_rel_resource_root)[:-len(file_extension)]
        # Drop the leading . from the file extension
        file_extension = file_extension[1:]
        if self.is_file_or_folder_in_HS(path_without_extension, file_extension):
            self.delete_file_or_folder_from_HS(full_file_path_rel_resource_root)
        folder_path = full_file_path_rel_resource_root.parent
        if str(folder_path) != '.':
            if not self.is_file_or_folder_in_HS(folder_path):
                self.remote_folder.create_folder(folder_path)

        full_src_path = self.path_prefix / str(full_file_path_rel_resource_root)
        self.remote_folder.upload_file_to_HS(full_src_path, full_file_path_rel_resource_root)
        self.hs_files = self.get_files_upon_init_HS()

    def get_resource_last_modified_time_HS(self):
        # TODO: (Charlie): This may not be necessary -- it's more specific than the dates provided in
        # the get resources func in resource_handler, but we might not care
        """
        Gets dates from the resource science metadata and returns the
        most recent modified time in datetime.datetime format

        Notes:
        metadata['dates'] gives array of two dicts with key 'start_date'
        that contains a time. One is creation and the other is last modified
        Need to compare and return the most recent time.
        Ex:
        'dates': [{'end_date': None,
            'start_date': '2019-05-15T19:31:38.201061Z',
            'type': 'created'},
           {'end_date': None,
            'start_date': '2019-05-15T19:32:36.139858Z',
            'type': 'modified'}],
        """
        metadata = self.hs.getScienceMetadata(self.res_id)
        # Obtain dates
        dates = []
        for date in metadata['dates']:
            temp = date['start_date']
            temp = dateutil.parser.parse(temp)
            dates.append(temp)
        # Compare dates to get most recent one (normally it's the first, but
        # it messes up if it's 'day of' for some reason)
        most_recent = max(dates)
        return most_recent # datetime.datetime

    def upload_file_to_JH(self, file_info):
        if self.is_file_or_folder_in_JH(self.path_prefix+file_info["filename"]) == False:
            self.local_folder.upload_file_to_JH(file_info, self.path_prefix)
            return True
        else:
            return "Error: a file " + file_info["filename"] +" already exists in JupyterHub at that location, cannot upload"
