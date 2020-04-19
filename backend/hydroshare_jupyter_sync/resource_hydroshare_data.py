"""
This file sets up the remote folder class for getting the files stored within
the remote hydroshare folder.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
"""
#!/usr/bin/python
# -*- coding: utf-8 -*-
import shutil
from uuid import uuid1

import hs_restclient
import datetime
from dateutil.parser import parse
import os
import logging
from pathlib import Path, PosixPath

HS_PREFIX = 'hs'


class ResourceHydroShareData:
    """ Class that defines a Remote Folder so we can access attributes of it.
    """
    def __init__(self, hs, res_id):
        """Authenticates Hydroshare & sets up class variables.
        """
        self.res_id = res_id
        self.hs = hs
        self._files = None

    def get_file_metadata(self, filepath, long_path, file_info, path_prefix):
        """Gets file definition formatting for returning HS files, given path
        & size. Returns false if the path is a folder & not a file.
        """
        # TODO (Emily) fix this function!
        modified_time = file_info.get("modified_time")
        if modified_time:
            modified_time = str(parse(modified_time))
        # if it is a file & has an extension then get name & extension
        if filepath.rfind("/") == -1 and filepath.rfind(".") != -1:
            file_type = filepath[filepath.rfind(".")+1:]
            filename = filepath[:filepath.rfind(".")]
            return ({
                "name": filename,
                "path": path_prefix + '/' + long_path.strip('/'),
                "sizeBytes": file_info.get("size"),
                "modifiedTime": modified_time,
                "type": file_type,
            })
        #TODO (Charlie): This might be simpler with pathlib
        elif filepath.rfind("/") == -1:

            return ({
                "name": filepath,
                "path": path_prefix + '/' + long_path.strip('/'),
                "sizeBytes": file_info.get("size"),
                "modifiedTime": modified_time,
                "type": "file",
            })
        else:
            return False

    def get_files(self, force_fetch=False):
        """ Gets all of the files in the resource in HydroShare
         The result is a dictionary that looks like the following:
             {
                "name": "",
                "path": HS_PREFIX + ":/",
                "sizeBytes": #,
                "type": "folder",
                "contents": [list of similar dicts representing files and folders],
            }
         """
        if self._files and not force_fetch:
            return self._files

        hs_resource_info = self.hs.getResourceFileList(self.res_id)
        url_prefix = 'http://www.hydroshare.org/resource/' + self.res_id + '/data/contents'
        folders_dict = {}
        root_dir_contents = []
        nested_files = {}
        for file_info in hs_resource_info:
            # extract filepath from url
            filepath = file_info["url"][len(url_prefix)+1:]
            # get proper definition formatting of file if it is a file
            file_definition_hs = self.get_file_metadata(filepath, filepath, file_info, HS_PREFIX+':')
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
                root_dir_contents.append(file_definition_hs)

        # go through folders dictionary & build up the nested structure
        i = 0
        for key, val in folders_dict.items():
            # we only want to make the initial call on folders at the top level,
            # (level 0); folders at levels 1, 2, etc. will be built into the
            # result by means of the recursive calls
            if key[0] == 0:
                folder_time, folder_size, folder_contents = self.get_contents_recursive(val, folders_dict,
                                                                                         nested_files, HS_PREFIX+':')
                if folder_time:
                    folder_time = str(folder_time)
                # TODO (vicky): use name and path instead of key[i]
                root_dir_contents.append({
                    "name": key[1],
                    "path": HS_PREFIX + ':/' + key[2].strip('/'),
                    "sizeBytes": folder_size,
                    "modifiedTime": folder_time,
                    "type": "folder",
                    "contents": folder_contents,
                })

        # TODO: probably add some comments explaining what these lines are doing
        rootsize = 0
        for f in root_dir_contents:
            rootsize += (f["sizeBytes"])

        self._files = {
            "name": "",
            "path": HS_PREFIX + ":/",
            "sizeBytes": rootsize,
            "type": "folder",
            "contents": root_dir_contents,
        }

        return self._files

    def exists(self, item_path, file_extension=None):
        """ Checks if a file or folder exists in the resource on HydroShare

            :param item_path the name (sans extension) of the file or folder
            :param file_extension if a file, the extension of that file
            :return whether or not the file or folder exists in the resource on HydroShare
            :rtype bool
         """
        if not isinstance(item_path, PosixPath):
            item_path = Path(item_path)
        current_dir_contents = self.get_files().get('contents')
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

    def find_file_or_folder_metadata(self, path, metadata_dict):
        """ Recursively gets and returns the metadata dictionary that is
        nested within metadata dict for the file or folder at specified path.
        """
        if metadata_dict is None:
            raise Exception("File or folder not found.")
        if "/" in path:
            first_level, rest_of_path = path.split("/", 1)
            for dicts in metadata_dict:
                if dicts["name"] == first_level:
                    return self.find_file_or_folder_metadata(rest_of_path, dicts.get("contents"))
        else:
            for dicts in metadata_dict:
                name = dicts.get("name")
                if "." in path:
                    path_no_extension, extension = path.rsplit(".", 1)
                else:
                    path_no_extension = None
                if name == path or name == path_no_extension:
                    return dicts

    def remove_prefix(self, text, prefix):
        if text.startswith(prefix):
            return text[len(prefix):]
        return text

    # FIXME: Don't automatically overwrite existing file at destination
    def rename_or_move_file(self, src_path, dest_path):
        """ Moves or renames a file. If a file already exists at the destination, the file will be overwritten.
            :param src_path: the path to the file relative to the resource root
            :type src_path: PosixPath
            :param dest_path: the destination path (including the file name) relative to the resource root
            :type dest_path: PosixPath
        """
        metadata = self.find_file_or_folder_metadata(str(src_path), self.get_files()["contents"])
        if metadata["type"] == "folder":
            for child_file_or_folder in metadata.get("contents"):
                new_src = self.remove_prefix(child_file_or_folder.get("path"), HS_PREFIX + ':/')
                self.rename_or_move_file(new_src, dest_path)
        else:
            self.hs.resource(self.res_id).functions.move_or_rename({
                "source_path": str(src_path),
                "target_path": str(dest_path),
            })

    def download_to_local(self, local_data, src_path, dest_path, temp_dir=None):
        """ Copies a file or folder from HydroShare to the local filesystem

            :param local_data: the local resource data
            :type local_data: LocalFolder
            :param src_path: the path to the file to copy/download (relative to the resource root)
            :type src_path: PosixPath
            :param dest_path: the path to copy the file to in the local resource (relative to the resource root)
            :type dest_path: PosixPath
            :param temp_dir: the temporary directory to use when downloading the file
            :type temp_dir: PosixPath | None
         """
        metadata = self.find_file_or_folder_metadata(str(src_path), self.get_files()["contents"])
        if metadata["type"] == "folder":
            local_data.create_local_folder(dest_path)  # Does nothing if the folder already exists
            for child_file_or_folder in metadata['contents']:
                new_src = Path(self.remove_prefix(child_file_or_folder['path'], HS_PREFIX + ':/'))
                self.download_to_local(local_data, new_src, dest_path / new_src.name, temp_dir)
        else:
            # Download the file
            with open(str(local_data.data_path / dest_path), 'wb') as f:
                for chunk in self.hs.getResourceFile(self.res_id, str(src_path)):
                    f.write(chunk)

    def upload_from_local(self, local_data, src_path, dest_path):
        """ Copies a file or folder and its contents from the local filesystem to HydroShare

            :param local_data: the local copy of the resource
            :type local_data: LocalFolder
            :param src_path: the path to the file or folder to upload (relative to the resource root)
            :type src_path: PosixPath
            :param dest_path: the path to the folder to upload to in the resource on HydroShare
            :type dest_path: PosixPath
        """
        filesystem_item = local_data.data_path / src_path
        if filesystem_item.is_dir():
            try:  # Try to create the folder (it may already exist)
                self.create_folder(dest_path)
            except hs_restclient.HydroShareHTTPException:  # Folder already exists
                pass
            # Upload every child file or folder in this folder
            for child_item in filesystem_item.iterdir():
                self.upload_from_local(local_data, src_path / child_item.name, dest_path / child_item.name)
        else:  # It's a file
            try:  # Remove any existing copy of the file in its destination location
                self.delete_file_or_folder(dest_path)
            except hs_restclient.HydroShareHTTPException:
                pass  # File doesn't already exist in HS (that's fine)

            self.copy_file_from_local(filesystem_item, dest_path)

    def get_contents_recursive(self, val, folders_dict, nested_files, path_prefix):
        """Recursively build up nested folder structure for HS files
        """
        contents = []
        folder_size = 0
        folder_time = datetime.datetime.min
        for v in val:
            # TODO (Emily): unpack v
            if v in folders_dict:
                subfolder_time, subfolder_size, subfolder_contents = self.get_contents_recursive(folders_dict[v], folders_dict, nested_files, path_prefix)
                folder_size += subfolder_size
                if subfolder_time and folder_time and subfolder_time > folder_time:
                    folder_time = subfolder_time
                if subfolder_time:
                    subfolder_time = str(subfolder_time)
                contents.append({
                    "name": v[1],
                    "path": path_prefix + '/' + v[2].strip('/'),
                    "sizeBytes": subfolder_size,
                    "modifiedTime": subfolder_time,
                    "type": "folder",
                    "contents": subfolder_contents,
                })
            else:
                # TODO (Vicky): Comment this code!
                contents.append(self.get_file_metadata(v[1], v[2], nested_files[v[2]], path_prefix))
                folder_size += nested_files[v[2]]["size"]
                if nested_files[v[2]].get("modified_time"):
                    curr_time = parse(nested_files[v[2]].get("modified_time"))
                else:
                    curr_time = None
                if curr_time and folder_time and curr_time > folder_time:
                    folder_time = curr_time

        return folder_time, folder_size, contents

    def delete_file_or_folder(self, item_path):
        """ Attempts to delete a file or folder in HydroShare. """
        # First try deleting this as if it were a file
        try:
            self.hs.deleteResourceFile(self.res_id, item_path)
            return 'file'
        except hs_restclient.exceptions.HydroShareNotFound:
            # Either it's a folder (not a file) or it actually doesn't exist. Let's try assuming the former.
            self.hs.deleteResourceFolder(self.res_id, item_path)
            return 'folder'

    def copy_file_from_local(self, local_src_path, hs_dest_path):
        """ upload JH file to HS """
        # make sure input files exist
        if not os.path.exists(local_src_path):
            raise Exception(f'Could not find file: {local_src_path}')

        try:
            self.hs.addResourceFile(self.res_id, str(local_src_path), str(hs_dest_path))
        except hs_restclient.HydroShareHTTPException as e:
            logging.error(e)

    def create_folder(self, folder_path):
        """ Attempts to create a folder in the HydroShare resource
            :param folder_path: the path to the folder relative to the resource root
            :type folder_path: PosixPath 
        """
        if isinstance(folder_path, PosixPath):
            folder_path = str(folder_path)
        # Remove the leading /, if one exists
        if folder_path.startswith('/'):
            folder_path = folder_path[1:]
        try:
            self.hs.createResourceFolder(self.res_id, pathname=folder_path)
        except IndexError:
            logging.info("Folder already exists.")
