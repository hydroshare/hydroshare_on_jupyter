"""
# TODO
# - get hs resource
# - get files
# - get metadata
# - get user info

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
from collections import OrderedDict
import pandas as pd
# os.chdir(os.path.expanduser('a path')) # will change working directory


# auth - Future: get this info'
auth = HydroShareAuthBasic(username=username, password=password)
hs = HydroShare(auth=auth)

test_resource_id = '92ade040a75647ed8c9be452a86d90f5'
output_folder = 'hs_resources'
if not os.path.exists(output_folder):
    os.makedirs(output_folder)
    print("Made {} folder for new resources".format(output_folder))

def get_hs_resource(resource_id, output_folder, unzip=False):
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
        resource_metadata = hs.getSystemMetadata(resource_id)

        # generate absolute path to content for href
        content_dir = os.path.join(os.path.dirname(f), 'contents')
        cdir = '/hub/user-redirect/notebooks/notebooks/' + content_dir
        JH_resource_link = '<a href="{}" target="_blank">{}</a>'.format(cdir, resource_metadata['resource_title'])
        resource_metadata['JH_resource_link'] = JH_resource_link

        resource_name = resource_metadata['resource_title']
        data[resource_name] = resource_metadata
        # Made metadata dataframe if first resource
        # if first_resource:
        #     first_resource = False
        #     data = {}
        #     print("hello!!")
        #     for key in resource_metadata.keys():
        #         data[key] = [resource_metadata[key]]
        # else:
        #     for key in resource_metadata.keys():
        #         data[key].append(resource_metadata[key])

    # metadata_df = "There is no data"
    # if len(files) > 0:
    #     metadata_df = pd.DataFrame.from_dict(data)
    #     metadata_df.set_index('resource_title')
    #     # print(metadata_df['resource_title'])
    #     print(metadata_df)
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
    # username
    pass

def test_socket():
    pass

if __name__ == '__main__':
    # get_metadata(test_resource_id)
    # get_hs_resource(test_resource_id, output_folder, unzip=True)
    get_files_in_directory_with_metadata()
    # get_user_info()
    # test_socket()
