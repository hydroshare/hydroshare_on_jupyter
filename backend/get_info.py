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

POSSIBILITIES WITH HS API:

get_resource_map_xml
delete_file_from_resource
get_file_from_hs_resource
add_file_to_hs_resource
contents of specific folder from resource
create a folder for resource
delete a folder for resource
get science metadata xml_rdf for a resource
get science metadata as json for a resource
update science metadata for a resource
update custom science meatadata for a resource
move or rename a resource file
zip a resource file or folder
unzip a resource file or folder
create a copy of resource
create a new version of resource
upload files to a specific resource folder
create a referenced content file
update a referenced content file
set resource flags
to set file metadata
"""

### This works for public resources
from hs_restclient import HydroShare, HydroShareAuthBasic
from pprint import pprint
from login import username, password
import os
import glob
from collections import OrderedDict
import pandas as pd
# os.chdir(os.path.expanduser('a path')) # will change working directory


# auth - Future: get this info'
auth = HydroShareAuthBasic(username=username, password=password)
hs = HydroShare(auth=auth)

test_resource_id = 'c40d9567678740dab868f35440a69b30'
# test_resource_id = 'c0cdec34c3f84839b1ba2120bc3de211'

output_folder = 'hs_resources'
if not os.path.exists(output_folder):
    os.makedirs(output_folder)
    print("Made {} folder for new resources".format(output_folder))

def get_hs_resource(resource_id, output_folder, unzip=True):
    # Get actual resource
    if not os.path.exists('{}/{}'.format(output_folder, resource_id)):
        print("getting hs resource")
        hs.getResource(resource_id, destination=output_folder, unzip=unzip)
    else:
        print("Resource already exists!")

def get_files_in_directory_with_metadata():
    # uses HS API to retrieve metadata -- different than existing app

    files = glob.glob('hs_resources/*/*/data/resourcemetadata.xml')
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

def get_metadata(resource_id):
    """
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

def get_user_info():
    return hs.getUserInfo()

def test_socket():
    pass

"""IN HYDROSHARE"""
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
    fpath = '../hs_resources/{}/{}/readme.txt'.format(test_resource_id, test_resource_id)
    metadata = '[{"coverage":{"type":"period", "value":{"start":"01/01/2000", "end":"12/12/2010"}}}, {"creator":{"name":"John Smith"}}, {"creator":{"name":"Lisa Miller"}}]'
    extra_metadata = '{"key-1": "value-1", "key-2": "value-2"}'

    print("Creating resource")
    resource_id = hs.createResource(rtype, title, resource_file=fpath, keywords=keywords, abstract=abstract, metadata=metadata, extra_metadata=extra_metadata)
    print(resource_id)

    return

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

def rename_resource_in_HS():
    pass

# This will be terrible without an ID
def locate_resource_in_HS():
    # with ID: easy
    # without ID: hard
    pass

"""IN JUPYTERHUB"""
def create_resource_in_JH():
    pass

def rename_resource_in_JH():
    pass

def delete_resource_in_JH():
    pass

def locate_resource_in_JH():
    pass

"""Others"""
def get_list_of_user_resources():
    print("Getting resources")
    resources = hs.resources(owner=username)
    print("Resources obtained")
    for r in resources:
        print(r)

    return resources

if __name__ == '__main__':
    # get_metadata(test_resource_id)
    get_hs_resource(test_resource_id, output_folder, unzip=True)
    # get_files_in_directory_with_metadata()
    # create_resource_in_HS()
    get_list_of_user_resources()
    # get_user_info()
    # test_socket()

#bbc2bcea4db14f6cbde009a43c8a97a1
"""
import os
os.environ['JUPYTER_DOWNLOADS']
"""