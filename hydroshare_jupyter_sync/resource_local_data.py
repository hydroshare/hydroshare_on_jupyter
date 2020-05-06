"""
This file sets up the local data class for getting the files stored within
the local folder and the size of that folder.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# !/usr/bin/python
# -*- coding: utf-8 -*-

import os
import glob
import shutil
import datetime
from notebook.services.contents.filemanager import FileContentsManager
from pathlib import Path

from hydroshare_jupyter_sync.config_reader_writer import get_config_values

LOCAL_PREFIX = 'local'
_root_data_path = None


class ResourceLocalData:
    """ Represents the copy of a resource on the local filesystem """

    def __init__(self, resource_id):
        self.data_path = (_get_path_to_resources_data_root() / resource_id
                          / resource_id / 'data' / 'contents')

    def is_downloaded(self):
        """ Checks if a local copy of this resource's data exists """
        return self.data_path.exists()

    def get_size(self, folder_path):
        """ Gets the size of the contents of a folder stored locally """
        total_size = 0
        for path, dirs, files in os.walk(str(self.data_path / folder_path)):
            for f in files:
                fp = os.path.join(path, f)
                total_size += os.path.getsize(fp)
        return total_size

    def get_contents_recursive(self, folderpath, resource_data_root_dir,
                               path_prefix):
        """Uses recursion to get & properly nest contents of folders stored
        locally
        """
        # get all the files in the folder
        files = glob.glob('{}/*'.format(folderpath))
        # return empty list if the folder is empty
        if len(files) == 0:
            return []

        files2 = []
        for filepath in files:
            # check contents recursively:
            folder_contents = self.get_contents_recursive(
                                                    filepath,
                                                    resource_data_root_dir,
                                                    path_prefix)

            # Populate info:
            dirpath = Path(filepath)
            filename = dirpath.stem
            # Set file type
            if dirpath.is_file():  # is file
                if dirpath.suffix:
                    file_type = dirpath.suffix[1:]  # without '.'
                else:
                    file_type = 'file'
            elif dirpath.is_dir():  # is folder
                file_type = "folder"
            else:  # is neither
                file_type = "unknown"

            # if it was a folder, we need to populate its list of contents
            path_rel_resource_root = str(dirpath.relative_to(
                                                    resource_data_root_dir))
            if path_rel_resource_root == '.':
                path_rel_resource_root = '/'
            else:
                path_rel_resource_root = '/' + path_rel_resource_root
            if file_type == "folder":
                files2.append({
                    "name": filename,
                    "path": path_prefix + path_rel_resource_root,
                    "sizeBytes": self.get_size(filepath),
                    "modifiedTime": str(datetime.datetime.fromtimestamp(
                                                    dirpath.stat().st_mtime)),
                    "type": file_type,
                    "contents": folder_contents,
                })
            # otherwise we just get the relevant file information
            else:
                files2.append({
                    "name": filename,
                    "path": path_prefix + path_rel_resource_root,
                    "sizeBytes": os.path.getsize(filepath),
                    "modifiedTime": str(datetime.datetime.fromtimestamp(
                                                    dirpath.stat().st_mtime)),
                    "type": file_type,
                })
        return files2

    def get_readme(self):
        contents = "## No ReadMe.md file has been created for this " \
                   "resource\n Consider creating 'ReadMe.md' in your" \
                   " root folder to explain the details of your work."
        for file in self.data_path.glob('*.*'):
            if file.name.lower() == 'readme.md':
                with open(str(file)) as f:
                    contents = f.read()
        return contents

    def rename_or_move_item(self, src, dest, overwrite=False):
        """ Renames or moves a local file or folder.
        :param src: the source path, relative to the root of this resource's
        files
        :param dest: the destination path, relative to the root of this
         resource's files
        :param overwrite: whether or not to overwrite an existing file at the
        destination. If a file exists and this
        value is False, or if the destination is a folder and already exists,
        an IOError exception will be raised.
        """
        src_full_path = self.data_path / src
        dest_full_path = self.data_path / dest
        if not src_full_path.exists():
            raise IOError('Could not find the source file or folder.')
        if dest_full_path.exists():
            if dest_full_path.is_dir():
                raise IOError('The destination exists and is a folder.')
            if not overwrite:
                raise IOError('The destination exists. Specify overwrite=True'
                              ' to overwrite.')

        shutil.move(str(src_full_path), str(dest_full_path))

    def create_file(self, file_path):
        """Creates a new file with the given name in JH
        """
        full_path = self.data_path / file_path
        if full_path.exists():
            raise IOError('File already exists.')
        path_rel_cwd = Path(full_path).relative_to(Path.cwd())
        if file_path.lower().endswith('.ipynb'):
            FileContentsManager().new(path=str(path_rel_cwd))
        else:
            full_path.touch()

    def create_local_folder(self, folder_name):
        """ Creates a folder (and any parent folders needed)
            :param folder_name: the name of the folder to create, prefixed
            by the path to the folder relative to the
            resource root (i.e. to create "New folder" within "Folder A"
            in the resource root, pass
            'Folder A/New Folder'
         """
        folder_path = self.data_path / folder_name
        if folder_path.exists():
            if folder_path.is_dir():
                return  # Directory exists, so just ignore the request
            else:
                raise FileExistsError(f'Directory {str(folder_path)} exists')

        folder_path.mkdir()

    def delete_file_or_folder(self, item_path):
        """ Deletes a file or folder from the local filesystem.
            :param item_path the full path to the file or folder on the local
            filesystem
            :type item_path str | PosixPath
        """
        # Remove any leading /
        if item_path.startswith('/'):
            item_path = item_path[1:]

        item_full_path = self.data_path / item_path

        if item_full_path.is_dir():
            shutil.rmtree(str(item_full_path))
            return 'folder'
        else:
            os.remove(item_full_path)
            return 'file'

    def exists(self, item_path):
        """ Checks if a file or folder exists in the local copy of the
        resource's data. """
        return (self.data_path / item_path).exists()

    def get_files_and_folders(self, prefix_paths=True):
        """ Gets all of the files and folders contained by this resource in a
        tree format.
            :param prefix_paths: whether or not to prefix paths with 'local:'
            (so the frontend can distinguish from paths
             on HydroShare)
        """
        path_prefix = LOCAL_PREFIX+':' if prefix_paths else None
        return {
            "name": "",
            "path": LOCAL_PREFIX + ":/" if prefix_paths else "",
            "sizeBytes": self.get_size(self.data_path),
            "modifiedTime": str(datetime.datetime.fromtimestamp(
                                            self.data_path.stat().st_mtime)),
            "type": "folder",
            "contents": self.get_contents_recursive(self.data_path,
                                                    self.data_path,
                                                    path_prefix),
        }


def _get_path_to_resources_data_root():
    """ Gets the folder path to where local data is storedself.

        :return: path to local HS resources folder
    """
    global _root_data_path
    if _root_data_path is None:
        config = get_config_values(['dataPath'])
        if config and 'dataPath' in config:
            _root_data_path = Path.cwd() / config['dataPath']
        else:
            # TODO: Rename to hydroshare_resource_data
            _root_data_path = Path.cwd() / 'local_hs_resources'
        if not _root_data_path.is_dir():
            # Let any exceptions that occur bubble up
            _root_data_path.mkdir(parents=True)
    return _root_data_path
