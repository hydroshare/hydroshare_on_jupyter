'''
This file sets up the resource handler for working with resources in
hydroshare & jupyterhub.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

import os


''' Class that defines a handler for working with all of a user's resources.
This is where they will be able to delete a resource, create a new one, or
just get the list of a user's resources in hydroshare or jupyterhub.
'''
class ResourceHandler:

    def __init__(self):
        '''Makes an output folder for storing HS files locally, if none exists
        '''
        # Get path to this file's location
        current_path = os.path.dirname(os.path.realpath(__file__))
        self.output_folder = current_path + "/local_hs_resources"
        # Make directory if it doesn't exist
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)
            # TODO (vicky) set up logging system & remove prints
            print("Made {} folder for new resources".format(self.output_folder))
