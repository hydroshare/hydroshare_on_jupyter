'''
This file sets up the remote folder class for getting the files stored within
the remote hydroshare folder.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-



''' Class that defines a Remote Folder so we can access attributes of it.
'''
class RemoteFolder:
    def get_file_metadata(self, filepath, size):
        """Gets file definition formatting for returning HS files, given path
        & size. Returns false if the path is a folder & not a file.
        """
        if filepath.rfind("/") == -1 and filepath.rfind(".") != -1:
            file_type = filepath[filepath.rfind(".")+1:]
            filename = filepath[:filepath.rfind(".")]
            return ({
                "name": filename,
                "sizeBytes": size,
                "type": file_type,
            })
        elif filepath.rfind("/") == -1:
            return ({
                "name": filepath,
                "sizeBytes": size,
                "type": "file",
            })
        else:
            return False

    def get_contents_recursive(self, val, folders_dict, nested_files):
        """Recursively build up nested folder structure for HS files
        """
        contents = []
        folder_size = 0
        for v in val:
            if v in folders_dict:
                subfolder_size, subfolder_contents = self.get_contents_recursive(folders_dict[v], folders_dict, nested_files)
                folder_size += subfolder_size
                contents.append({
                    "name" : v[1],
                    "sizeBytes" : subfolder_size,
                    "type" : "folder",
                    "contents" : subfolder_contents,
                })
            else:
                contents.append(self.get_file_metadata(v[1], nested_files[v[2]]["size"]))
                folder_size += nested_files[v[2]]["size"]

        return folder_size, contents
