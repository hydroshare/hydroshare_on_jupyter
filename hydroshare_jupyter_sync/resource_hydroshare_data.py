"""
This file sets up the remote folder class for getting the files stored within
the remote hydroshare folder.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# !/usr/bin/python
# -*- coding: utf-8 -*-

import hs_restclient
import datetime
from dateutil.parser import parse
from pathlib import Path, PosixPath
import os

HS_PREFIX = 'hs'


class ResourceHydroShareData:
    """ Represents the copy of a resource on HydroShare """
    def __init__(self, hs, res_id):
        self.res_id = res_id
        self.hs_api_conn = hs
        self._files = None

    def _get_file_metadata(self, filepath, long_path, file_info, path_prefix):
        """Gets file definition formatting for returning HS files, given path
        & size. Returns false if the path is a folder & not a file.
        """
        filepath = Path(filepath)
        modified_time = file_info.get("modified_time")
        if modified_time:
            modified_time = str(parse(modified_time))
        # if it is a file & has an extension then get name & extension
        if len(filepath.parts) == 1:
            file_type = "File"
            if filepath.suffix != '':
                file_type = filepath.suffix[1:]
            filename = filepath.stem
            return ({
                "name": filename,
                "path": path_prefix + '/' + long_path.strip('/'),
                "sizeBytes": file_info.get("size"),
                "modifiedTime": modified_time,
                "type": file_type,
            })
        else:
            return False

    def get_files(self, force_fetch=False):
        """ Gets all of the files in the resource in HydroShare

            :param force_fetch: whether to request the files from HydroShare
            even if a local cache exists
            :type force_fetch: bool
            :returns {
                "name": "",
                "path": HS_PREFIX + ":/",
                "sizeBytes": #,
                "type": "folder",
                "contents": [list of similar dicts representing files and
                folders],
            }
            :rtype dict
         """
        if self._files and not force_fetch:
            return self._files

        hs_resource_info = self.hs_api_conn.getResourceFileList(self.res_id)
        url_prefix = ('http://www.hydroshare.org/resource/' + self.res_id +
                      '/data/contents')
        folders_dict = {}
        root_dir_contents = []
        nested_files = {}
        for file_info in hs_resource_info:
            # extract filepath from url
            filepath = file_info["url"][len(url_prefix)+1:]
            # get proper definition formatting of file if it is a file
            file_definition_hs = self._get_file_metadata(filepath, filepath,
                                                         file_info,
                                                         HS_PREFIX + ':')
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
                    folders_dict[(x, folder, currpath)].append((x+1,
                                                                folders[x+1],
                                                                (currpath +
                                                                 folders[x+1] +
                                                                 "/")))
            # if it is just a file, add it to the final list
            else:
                root_dir_contents.append(file_definition_hs)

        # go through folders dictionary & build up the nested structure
        for key, val in folders_dict.items():
            # we only want to make the initial call on folders at the top
            # level, (level 0); folders at levels 1, 2, etc. will be built
            # into the result by means of the recursive calls
            if key[0] == 0:
                folder_time, folder_size, folder_contents = (
                            self._get_contents_recursive(val, folders_dict,
                                                         nested_files,
                                                         HS_PREFIX + ':'))
                if folder_time:
                    folder_time = str(folder_time)
                level, name, path = key
                root_dir_contents.append({
                    "name": name,
                    "path": HS_PREFIX + ':/' + path.strip('/'),
                    "sizeBytes": folder_size,
                    "modifiedTime": folder_time,
                    "type": "folder",
                    "contents": folder_contents,
                })

        # calculate the size of root folder by summing size of contents
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
            :return whether or not the file or folder exists in the resource
            on HydroShare
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
                    elif (file_extension is not None and
                          file_or_folder["type"] == file_extension):
                        return True
            if not found_next_part:
                return False

        return False

    def _find_file_or_folder_metadata(self, path, metadata_dict):
        """ Recursively gets and returns the metadata dictionary that is
        nested within metadata dict for the file or folder at specified path.
        """
        if metadata_dict is None:
            raise FileNotFoundError("File or folder not found.")
        path = Path(path)

        # Check if this file is within a folder
        if len(path.parts) > 1:
            highest_parent_folder = path.parts[0]
            rest_of_path = os.path.relpath(path, highest_parent_folder)
            for file_or_folder in metadata_dict:
                if file_or_folder["name"] == highest_parent_folder:
                    contents = file_or_folder.get("contents")
                    return self._find_file_or_folder_metadata(
                                                        rest_of_path,
                                                        contents)
            # File or folder metadata not found
            return None

        for file_or_folder in metadata_dict:
            name = file_or_folder["name"]
            # checks if the name is the path (meaning it is a folder or
            # file with no extension) or if name is path_no_extension (
            # meaning it is a file with extension)
            if name == str(path) or name == str(path.stem):
                return file_or_folder

        # File or folder metadata not found
        return None

    def _remove_prefix(self, text, prefix):
        return text[len(prefix):] if text.startswith(prefix) else text

    def rename_or_move_file(self, src_path, dest_path):
        """ Moves or renames a file.

            :param src_path: the path to the file relative to the resource root
            :type src_path: PosixPath
            :param dest_path: the destination path (including the file name)
            relative to the resource root
            :type dest_path: PosixPath
            :raises FileExistsError if a file already exists at the destination
        """
        if (self._find_file_or_folder_metadata(str(dest_path),
                                               self.get_files()["contents"])
                is not None):
            raise FileExistsError(f'The file {dest_path} already exists.')

        metadata = self._find_file_or_folder_metadata(str(src_path),
                                                      self.get_files()
                                                      ["contents"])
        if metadata["type"] == "folder":
            if len(metadata.get("contents")) == 0:
                (self.hs_api_conn.resource(self.res_id).functions.
                    move_or_rename({
                        "source_path": str(src_path),
                        "target_path": str(dest_path),
                        }))
            for child_file_or_folder in metadata.get("contents"):
                new_src = self._remove_prefix(child_file_or_folder.get("path"),
                                              HS_PREFIX + ':/')
                self.rename_or_move_file(new_src, dest_path)
        else:
            self.hs_api_conn.resource(self.res_id).functions.move_or_rename({
                "source_path": str(src_path),
                "target_path": str(dest_path),
            })

    def download_to_local(self, local_data, src_path, dest_path,
                          temp_dir=None):
        """ Copies a file or folder from HydroShare to the local filesystem

            :param local_data: the local resource data
            :type local_data: LocalFolder
            :param src_path: the path to the file to copy/download (relative to
            the resource root)
            :type src_path: PosixPath
            :param dest_path: the path to copy the file to in the local
            resource (relative to the resource root)
            :type dest_path: PosixPath
            :param temp_dir: the temporary directory to use when downloading
            the file
            :type temp_dir: PosixPath | None
         """
        metadata = self._find_file_or_folder_metadata(str(src_path),
                                                      self.get_files()
                                                      ["contents"])
        if metadata["type"] == "folder":
            # Does nothing if the folder already exists
            local_data.create_local_folder(dest_path)
            for child_file_or_folder in metadata['contents']:
                new_src = Path(self._remove_prefix(
                                        child_file_or_folder['path'],
                                        HS_PREFIX + ':/'))
                self.download_to_local(local_data, new_src, dest_path /
                                       new_src.name, temp_dir)
        else:
            # Download the file
            with open(str(local_data.data_path / dest_path), 'wb') as f:
                for chunk in self.hs_api_conn.getResourceFile(self.res_id,
                                                              str(src_path)):
                    f.write(chunk)

    def upload_from_local(self, local_data, src_path, dest_path):
        """ Copies a file or folder and its contents from the local filesystem
            to HydroShare

            :param local_data: the local copy of the resource
            :type local_data: LocalFolder
            :param src_path: the path to the file or folder to upload (relative
            to the resource root)
            :type src_path: PosixPath
            :param dest_path: the path to the folder to upload to in the
            resource on HydroShare
            :type dest_path: PosixPath
            :returns the details of the error encountered as { 'type': str,
            'message': str}
            :rtype dict | None
        """
        filesystem_item = local_data.data_path / src_path
        if filesystem_item.is_dir():
            try:  # Try to create the folder (it may already exist)
                self.create_folder(dest_path)
            # Folder already exists
            except hs_restclient.HydroShareHTTPException:
                pass
            # Upload every child file or folder in this folder
            for child_item in filesystem_item.iterdir():
                self.upload_from_local(local_data, src_path / child_item.name,
                                       dest_path / child_item.name)
        elif filesystem_item.is_file():  # It's a file
            # Remove any existing copy of the file in its destination location
            try:
                self.delete_file_or_folder(dest_path)
            except hs_restclient.HydroShareHTTPException:
                pass  # File doesn't already exist in HS (that's fine)
            try:  # Now try to upload the file
                self.hs_api_conn.addResourceFile(self.res_id,
                                                 str(filesystem_item),
                                                 str(dest_path))
            except hs_restclient.HydroShareHTTPException as e:
                return {
                    'type': 'GenericHydroShareHTTPException',
                    'message': e.status_msg,
                }
        else:  # Couldn't find the source file
            return {
                'type': 'FileNotFoundError',
                'message': f'Could not find file: {filesystem_item}',
            }
        return None  # No error

    def _get_contents_recursive(self, val, folders_dict, nested_files,
                                path_prefix):
        """Recursively build up nested folder structure for HS files
        """
        contents = []
        folder_size = 0
        folder_time = datetime.datetime.min
        for v in val:
            level, name, path = v
            # if it is in the folders dictionary, then it is a folder
            if v in folders_dict:
                # recursively build up size, most recent modified time,
                # and contents for folders
                subfolder_time, subfolder_size, subfolder_contents = (
                    self._get_contents_recursive(folders_dict[v], folders_dict,
                                                 nested_files, path_prefix))
                folder_size += subfolder_size
                if (subfolder_time and folder_time and
                        subfolder_time > folder_time):
                    folder_time = subfolder_time
                if subfolder_time:
                    subfolder_time = str(subfolder_time)
                contents.append({
                    "name": name,
                    "path": path_prefix + '/' + path.strip('/'),
                    "sizeBytes": subfolder_size,
                    "modifiedTime": subfolder_time,
                    "type": "folder",
                    "contents": subfolder_contents,
                })
            else:
                # v is not a folder, so must be a file, get its metadata
                contents.append(self._get_file_metadata(name, path,
                                nested_files[path], path_prefix))
                # nested_files is a dictionary which stores file info
                # (such as size & modified time)
                # key is path to the file & value is file info dictionary
                # update size of folder by adding in size of this file
                folder_size += nested_files[path]["size"]
                if nested_files[path].get("modified_time"):
                    curr_time = parse(nested_files[path].get("modified_time"))
                else:
                    curr_time = None
                # update modified time of the folder if this file has been
                # edited more recently
                if curr_time and folder_time and curr_time > folder_time:
                    folder_time = curr_time

        return folder_time, folder_size, contents

    def delete_file_or_folder(self, item_path):
        """ Attempts to delete a file or folder in HydroShare

            :param item_path: the path to the file or folder to delete
            (relative to the resource root)
            :type item_path: PosixPath | str
            :returns 'file' if the deleted item was a file, 'folder' if it was
            a folder
            :rtype str
         """
        # First try deleting this as if it were a file
        try:
            self.hs_api_conn.deleteResourceFile(self.res_id, str(item_path))
            return 'file'
        except hs_restclient.exceptions.HydroShareNotFound:
            # Either it's a folder (not a file) or it actually doesn't exist.
            # Let's try assuming the former.
            self.hs_api_conn.deleteResourceFolder(self.res_id, str(item_path))
            return 'folder'

    def create_folder(self, folder_path):
        """ Attempts to create a folder in the HydroShare resource
            :param folder_path: the path to the folder relative to the resource
            root
            :type folder_path: PosixPath
        """
        if isinstance(folder_path, PosixPath):
            folder_path = str(folder_path)
        # Remove the leading /, if one exists
        if folder_path.startswith('/'):
            folder_path = folder_path[1:]
        self.hs_api_conn.createResourceFolder(self.res_id,
                                              pathname=folder_path)
