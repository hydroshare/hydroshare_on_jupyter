# TODO: rename this file! (maybe to hydroshare_resource or hs_resource?)
"""
This file sets up the resource class for getting and updating files &
information associated with a given resource in Jupyterhub & Hydroshare.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
"""
#!/usr/bin/python
# -*- coding: utf-8 -*-

# TODO: remove unused imports
from hydroshare_jupyter_sync_pkg.local_folder import LocalFolder
from hydroshare_jupyter_sync_pkg.remote_folder import RemoteFolder
import logging
import os
from os import path
from dateutil.parser import parse
import datetime
# note from Kyle for Charlie: you mean change to import pathlib as pl?
from pathlib import * # TODO: Charlie, change to pl for readability
import shutil

# TODO: we should probably rename all "JH" to "local" or just "jupyter" or something like that, since this is supposed
# to be platform-independent
HS_PREFIX = 'hs'
LOCAL_PREFIX = 'local'


class Resource:
    """ Class that defines a Hydroshare resource & it's associated files that
    are local to Jupyterhub.
    """

    def __init__(self, res_id, resource_handler):
        """Authenticates Hydroshare & sets up class variables.
        """
        self.res_id = res_id
        self.resource_handler = resource_handler
        self.output_folder = self.resource_handler.output_folder
        self.hs = self.resource_handler.hs

        # SPIFFY (Emily) I wonder, should we rename RemoteFolder to HSFolder or something?
        self.remote_folder = RemoteFolder(self.hs, self.res_id)
        self.local_folder = LocalFolder()

        # SPIFFY (Emily) this is for me and my path task, but is this the right way of doing Path stuff?
        self.path_prefix = Path(self.output_folder) / self.res_id / self.res_id / 'data' / 'contents'
        self.hs_files = self.get_files_upon_init_HS()
        self.JH_files = self.get_files_upon_init_JH()


    def create_file_JH(self, filename):
        """Creates a new file with the given name in JH
        """
        # TODO: TEST THIS! & add more error checking to this function, does it exist?
        if filename is not None:
            (self.path_prefix / filename).touch()

    def save_resource_locally(self, unzip=True):
        """Saves the HS resource locally, if it does not already exist.
        """
        # Get resource from HS if it doesn't already exist locally
        if not os.path.exists('{}/{}'.format(self.output_folder, self.res_id)):

            logging.info("Downloading resource from HydroShare...")
            self.hs.getResource(self.res_id, destination=self.output_folder, unzip=unzip)

    def get_files_JH(self):
        # SPIFFY (Vicky): do we want it to update if someone creates a file not on our app but in their JH folder?
        # SPIFFY (Emily) maybe but how do we check that that occurs? Have a cron that periodically refreshes?
        return self.JH_files

    def get_files_upon_init_JH(self):
        """Gets metadata for all the files currently stored in the JH instance
        of this resource.
        """

        self.save_resource_locally()
        resource_files_root_path = Path(self.path_prefix)
        if not resource_files_root_path.exists():
            resource_files_root_path.mkdir(parents=True)
        files = self.local_folder.get_contents_recursive(self.path_prefix, resource_files_root_path, LOCAL_PREFIX+':')
        root_dir = {
            "name": "",
            "path": LOCAL_PREFIX + ":/",
            "sizeBytes": self.local_folder.get_size(self.path_prefix),
            "modifiedTime": str(datetime.datetime.fromtimestamp(resource_files_root_path.stat().st_mtime)),
            "type": "folder",
            "contents": files,
        }
        return root_dir

    def update_hs_files(self):
        # SPIFFY (Vicky) interesting.. do we want an update for HS? when is this called?
        # SPIFFY (Emily) maybe but how do we check that that occurs? Have a cron that periodically refreshes?
        # looks like it is only called in delete.. in which case, this won't update if you make changes on HS?
        self.hs_files = self.get_files_upon_init_HS()

    def get_files_HS(self):
        return self.hs_files

    def get_files_upon_init_HS(self):
        """Gets metadata for all the files currently stored in the HS instance
        of this resource.
        """

        # TODO (Vicky) fix this function & break it out into multiple functions
        # get the file information for all files in the HS resource in json
        # spiffy: can we remove this?
        #print(self.hs.resource(self.res_id).files.all().json())
        # testing = (self.hs.getResourceFileList(self.res_id))
        # for test in testing:
        #     print("THIS IS A TEST")
        #     print(test)
        hs_resource_info = (self.hs.getResourceFileList(self.res_id))
        url_prefix = 'http://www.hydroshare.org/resource/' + self.res_id + '/data/contents'
        folders_dict = {}
        folders_final = []
        nested_files = {}
        # TODO: remove commented-out lines?
        try:
            # get the needed info for each file
            for file_info in hs_resource_info:
                # print(file_info)
                # extract filepath from url
                filepath = file_info["url"][len(url_prefix)+1:]
                # get proper definition formatting of file if it is a file
                file_definition_hs = self.remote_folder.get_file_metadata(filepath, filepath, file_info,
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
        except Exception as e:
            # TODO: get rid of this nonsense once things are working
            print(type(e))
            # print(e.url)
            # print(e.method)
            # print(e.status_code)
            # print(e.status_msg)


        # go through folders dictionary & build up the nested structure
        i = 0
        for key, val in folders_dict.items():
            # we only want to make the initial call on folders at the top level,
            # (level 0); folders at levels 1, 2, etc. will be built into the
            # result by means of the recursive calls
            if key[0] == 0:
                folder_time, folder_size, folder_contents = self.remote_folder.get_contents_recursive(val, folders_dict,
                                                                                         nested_files, HS_PREFIX+':')
                if folder_time:
                    folder_time = str(folder_time)
                # spiffy: use folder_size and folder_contents instead of key[i]
                folders_final.append({
                    "name": key[1],
                    "path": HS_PREFIX + ':/' + key[2].strip('/'),
                    "sizeBytes": folder_size,
                    "modifiedTime": folder_time,
                    "type": "folder",
                    "contents": folder_contents,
                })

        # TODO: probably add some comments explaining what these lines are doing
        rootsize = 0
        for f in folders_final:
            rootsize += (f["sizeBytes"])

        folder_time = datetime.datetime.min
        for f in folders_final:
            if f.get("modifiedTime"):
                curr_time = parse(f.get("modifiedTime"))
                if curr_time > folder_time:
                    folder_time = curr_time

        # spiffy: could we not just set it to None to start?
        if folder_time == datetime.datetime.min:
            folder_time = None
        else:
            folder_time = str(folder_time)

        root_dir = {
            "name": "",
            "path": HS_PREFIX + ":/",
            "sizeBytes": rootsize,
            "modifiedTime": folder_time,
            "type": "folder",
            "contents": folders_final,
        }

        return root_dir

    def rename_or_move_file_HS(self, old_filepath, new_filepath):
        """Renames the hydroshare version of the file from old_filename to
        new_filename.
        """
        # TODO: throw an exception if either of the parameters are None. Checking the paths is
        # something the calling function should handle
        if old_filepath is not None and new_filepath is not None:
            if self.is_file_in_HS(old_filepath):
                self.remote_folder.rename_or_move_file(old_filepath, new_filepath)
                # spiffy: what is this doing and how is it working?
                if len(old_filepath.rsplit("/", 1)) > 1:
                    folderpath, filename = old_filepath.rsplit("/", 1)
                    # SPIFFY (vicky): is the whole deleting thing possibly related to breaking resources?
                    # SPIFFY (Emily) before we did this, if we deleted an element from an empty folder and then tried to
                    # create that folder again (bc HS wouldn't tell us that that folder still existed), the resource would break. so maybe this stopped working?
                    self.delete_HS_folder_if_empty(folderpath, filename)
            else:
                # TODO: probably another exception here so that the calling function knows something went wrong
                # and can notify the frontend
                logging.info('Trying to rename or move file that does not exist: ' + old_filepath)
        else:
            logging.info('Missing inputs for old and new filepath')

    # TODO: probably remove and use is_file_or_folder_in_HS instead
    def is_file_in_HS(self, filepath):
        """ does a file exist in hs_files """
        files_info = self.hs_files["contents"]

        for file_dict in files_info:
            # cut out the hs:/ at beginning of path in comparison
            if filepath == file_dict["path"][4:]:
                return True

        return False

    def rename_or_move_file_JH(self, old_filepath, new_filepath):
        """Renames the jupyterhub version of the file from old_filename to
        new_filename.
        """
        # TODO: should probably throw an exception if this is not true
        if old_filepath is not None and new_filepath is not None:
            src_full_path = self.path_prefix / old_filepath
            dest_full_path = self.path_prefix / new_filepath
            if src_full_path.exists():
                shutil.move(str(src_full_path), str(dest_full_path))
                self.delete_JH_folder_if_empty(src_full_path.parent)
            else:  # TODO: also an exception
                logging.info('Trying to rename or move file that does not exist: ' + old_filepath)
        else:
            logging.info('Missing inputs for old and new filepath')

    def delete_file_or_folder_from_JH(self, item_path):
        """ Deletes a file or folder from the local filesystem.
            :param item_path the full path to the file or folder on the local filesystem
            :type item_path str | PosixPath
        """
        # Remove any leading /
        if item_path.startswith('/'):
            item_path = item_path[1:]

        item_full_path = self.path_prefix / item_path

        if item_full_path.is_dir():
            self.local_folder.delete_folder(item_full_path)
            return 'folder'
        else:
            self.local_folder.delete_file(item_full_path)
            return 'file'

    def delete_JH_folder_if_empty(self, filepath):
        """ deletes JH folder if it is empty
        calls delete_file_or_folder_from JH to check if
        parent directory needs to be deleted """

        if len(list((self.path_prefix / filepath).iterdir())) == 0:
            self.delete_file_or_folder_from_JH(filepath)

    # TODO: use 'exists' in this function name
    def is_file_or_folder_in_JH(self, filepath):
        """ is a file in JH """
        return path.isfile(filepath)

    def delete_file_or_folder_from_HS(self, item_path):
        """ deletes file or folder from HS """
        return self.remote_folder.delete_file_or_folder(item_path)

    def delete_HS_folder_if_empty(self, folderpath, acceptable_name):
        """ deletes folder from HS if it is empty
        this can only be used with hs_files as the HydroShare API does not give us empty
        folders when giving us files. This function should only be used if a recent
        action could have caused a folder to be empty """
        # TODO: snake_case_please
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

    # TODO: change name to include "exists"
    def is_file_or_folder_in_HS(self, item_path, file_extension=None):
        """ Checks if a file or folder exists in a HydroShare resource
            :param item_path the name (sans extension) of the file or folder
            :param file_extension if a file, the extension of that file
         """
        if not isinstance(item_path, PosixPath):
            item_path = Path(item_path)
        current_dir_contents = self.hs_files.get('contents')
        # SPIFFY (Emily) sigh why does HS have to be so chaotic? I wrote this, but it doesn't seem super elegant
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


    def overwrite_JH_with_file_from_HS(self, filepath, dest_path):
        """ overwrites JH file with one from HS """
        if self.is_file_or_folder_in_JH(dest_path):
            self.delete_file_or_folder_from_JH(dest_path)
        if "/" in filepath:
            # create local folders that lead to dest_path if they don't exist
            output_path, filename = dest_path.rsplit('/', 1)
            if self.is_file_or_folder_in_JH(output_path) == False:
                os.makedirs(str(self.path_prefix) + "/" + output_path + "/")
        self.remote_folder.download_file_to_JH(filepath, str(self.path_prefix) + "/" + dest_path)
        # SPIFFY (Vicky) prob shouldn't be calling an upon init thing? so maybe make an update function?
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
        # SPIFFY (Vicky): based on things Kyle was seeing, is below not working?
        if self.is_file_or_folder_in_HS(path_without_extension, file_extension):
            self.delete_file_or_folder_from_HS(full_file_path_rel_resource_root)
        folder_path = full_file_path_rel_resource_root.parent
        if str(folder_path) != '.':
            if not self.is_file_or_folder_in_HS(folder_path):
                self.remote_folder.create_folder(folder_path)

        full_src_path = self.path_prefix / str(full_file_path_rel_resource_root)
        self.remote_folder.upload_file_to_HS(full_src_path, full_file_path_rel_resource_root)
        self.hs_files = self.get_files_upon_init_HS()

    # TODO (Vicky): pretty sure I have a task for this
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
            # SPIFFY (Emily) I get an "undefined variable dateutil" warning here
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
            # spiffy: probably throw an exception here instead
            return "Error: a file " + file_info["filename"] +" already exists in JupyterHub at that location, cannot upload"
