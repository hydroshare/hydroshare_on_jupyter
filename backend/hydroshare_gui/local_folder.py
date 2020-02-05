'''
This file sets up the local folder class for getting the files stored within
the folder and the size of that folder.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

import os


''' Class that defines a Local Folder so we can access attributes of it.
'''
class LocalFolder:

    def get_size(self, folderpath):
        """ Gets the size of the contents of a folder stored locally
        """
        total_size = 0
        for path, dirs, files in os.walk(folderpath):
            for f in files:
                fp = os.path.join(path, f)
                total_size += os.path.getsize(fp)
        return total_size

    def get_contents_recursive(self, folderpath):
        """Uses recursion to get & properly nest contents of folders stored locally
        """
        # get all the files in the folder
        files = glob.glob('{}/*'.format(folderpath))
        # return empty list if the folder is empty
        if len(files) == 0:
            return []
        files2 = []
        for filepath in files:
            # +1 is to account for / after folderpath before file name
            # TODO (charlie): use pathlib instead of doing string manipulations
            file = filepath[len(folderpath)+1:]
            folder_contents = self.get_contents_recursive(filepath)
            # TODO (vicky) add some comments here explaining what these conditionals are checking
            if (len(folder_contents) == 0 and
                                                    file.rfind(".") != -1):
                file_type = file[file.rfind(".")+1:]
                filename = file[:file.rfind(".")]
            elif os.path.isfile(filepath):
                file_type = "file"
                filename = file
            elif os.path.isdir(filepath):
                file_type = "folder"
                filename = file
            else:
                file_type = "unknown"
                filename = file
            if file_type == "folder":
                files2.append({
                    "name": filename,
                    "sizeBytes": self.get_size(filepath),
                    "type": file_type,
                    "contents": folder_contents,
                })
            else:
                files2.append({
                    "name": filename,
                    "sizeBytes": os.path.getsize(filepath),
                    "type": file_type,
                })
        return files2
