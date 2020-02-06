# TODO (vicky): break up this file
# We might want to place all file transferring functionality in one file
# Make a file for resource metadata fetching functionality

# TODO  (vicky): let's get this header updated - I think it is mostly outdated at this point
# also instead of listing things like this here we can write the function definitions and just pass
# them until we have them fully implemented & make tasks in asana to fill them in
"""


TODO
- get hs resource
- get files
- get metadata
- get user info

Get Name, Author, last updated, resource (rename, delete, publish, locate)
NOTE: Need access to private resources

CURRENT:
- get hs resource (with files) with resource id
- get metadata with resource id

"""

### This works for public resources
from hs_restclient import HydroShare, HydroShareAuthBasic
from pprint import pprint
from login import username, password
import os
import glob
import json
from metadata_parser import MetadataParser
from collections import OrderedDict
import pandas as pd

# TODO (charlie): make this into a class & put this code in init
auth = HydroShareAuthBasic(username=username, password=password)
hs = HydroShare(auth=auth)

# TODO (vicky): Once create resource is working, remove this line
test_resource_id = 'c40d9567678740dab868f35440a69b30'

### Making directory for local hs resources
get_info_path = os.path.dirname(os.path.realpath(__file__)) # Get path to this file's location
# output_folder = 'backend/tests/hs_resources'
output_folder = get_info_path + "/local_hs_resources"
if not os.path.exists(output_folder): # Make directory if it doesn't exist
    os.makedirs(output_folder)
    # TODO (vicky) set up logging system & remove prints
    print("Made {} folder for new resources".format(output_folder))


# TODO (charlie): investigate whether we can delete
def get_metadata_of_all_files():
    #TODO scrape from xml file instead of API call

    # uses HS API to retrieve metadata -- different than existing app

    files = glob.glob('{}/*/*/data/resourcemetadata.xml'.format(output_folder))
    data = {}

    # TODO: Get ltime and size
    for f in files:
        # get ID and metadata
        resource_id = f.split('/')[1]

        # TODO: Modify this to extract data from xml files (work around for 'private' permissions with hs api)

        resource_metadata = hs.getSystemMetadata(resource_id)

        # generate absolute path to content for href
        content_dir = os.path.join(os.path.dirname(f), 'contents')
        cdir = '/hub/user-redirect/notebooks/notebooks/' + content_dir
        JH_resource_link = '<a href="{}" target="_blank">{}</a>'.format(cdir, resource_metadata['resource_title'])
        resource_metadata['JH_resource_link'] = JH_resource_link

        pprint(resource_metadata.keys())

        resource_name = resource_metadata['resource_title']
        data[resource_name] = resource_metadata

    if len(data) == 0:
        data = "There is no data"
    return data

# TODO (charlie): investigate whether we can delete, possibly use Kyle's MetadataParser class
def get_metadata_one_file(resource_id):
    """
    #TODO scrape from xml file instead of API call
    Get metadata for one resource. Contains:
        - abstract
        - authors
        - bag_url
        - coverages
        - creator
        - date_created
        - date_last_updated
        - discoverable
        - doi
        - immutable
        - public
        - published
        - resource_id
        - resource_map_url
        - resource_title
        - resource_type
        - resource_url
        - science_metadata_url
        - shareable
    """
    print("getting hs resource metadata")
    resource_md = hs.getSystemMetadata(resource_id)
    print(resource_md['resource_title'])
    pprint(resource_md)
    return(resource_md)


"""IN HYDROSHARE"""
# TODO (vicky): make this just create resource, not specific to HS
def create_resource_in_HS():
    # Creates a private resource for user
    """
    TODO:
    - Check if resource exists (API will just create a duplicate!)
    - Check if public
    """

    abstract = 'My abstract'
    title = 'Where does this go?'
    keywords = ('my keyword 1', 'my keyword 2')
    rtype = 'GenericResource'
    fpath = output_folder + '/{}/{}/readme.txt'.format(test_resource_id, test_resource_id)
    metadata = '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"John Smith"}}, {"creator":{"name":"Lisa Miller"}}]'
    extra_metadata = '{"key-1": "value-1", "key-2": "value-2"}'

    print("Creating resource")
    resource_id = hs.createResource(rtype, title, resource_file=fpath, keywords=keywords, abstract=abstract, metadata=metadata, extra_metadata=extra_metadata)
    print(resource_id)

    return

# TODO (charlie): rename and allow for setting to public or private
def make_resource_public_in_HS(resource_id):
    hs.setAccessRules(resource_id, public=True)

def delete_resource_in_HS(resource_id):
    hs.deleteResource(resource_id)

def update_resource_in_HS(local_file_path, resource_folder_path, resource_id):
    options = {
                 "folder": resource_folder_path,
                 "files": local_file_path
              }
    result = hs.resource(resource_id).files(options)
    return result

# TODO (charlie): investigate & make work, rename should be just one thing for JH & HS, flags
def rename_resource_in_HS():    # files2 = []
    # for filepath in files:
    #     file = filepath[len(prefix):]
    #     if file.rfind(".") != -1:
    #         type = file[file.rfind(".")+1:]
    #         filename = file[:file.rfind(".")]
    #     else:
    #         type = "folder"
    #         filename = file
    #     if type == "folder":
    #         files2.append({"file_name": filename, "type": type, "size": os.path.getsize(filepath), "contents": get_recursive_folder_contents(filepath)})
    #     else:
    #         files2.append({"file_name": filename, "type": type, "size": os.path.getsize(filepath)})
    pass

"""IN JUPYTERHUB"""
def delete_resource_in_JH():
    pass

def locate_resource_in_JH():
    pass


def get_folder_last_modified_time(id):
    # This is where we can get folder last modified time
    metadata = hs.getScienceMetadata(id)
    # TODO: extract modified time from metadata
    return


if __name__ == '__main__':
    pass

#bbc2bcea4db14f6cbde009a43c8a97a1
