# We might want to place all file transferring functionality in one file
# Make a file for resource metadata fetching functionality

# TODO  (charlie): DELETE THIS FILE
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

# TODO (charlie): rename and allow for setting to public or private
def make_resource_public_in_HS(resource_id):
    hs.setAccessRules(resource_id, public=True)


def get_folder_last_modified_time(id):
    # This is where we can get folder last modified time
    metadata = hs.getScienceMetadata(id)
    # TODO: extract modified time from metadata
    return


if __name__ == '__main__':
    pass

#bbc2bcea4db14f6cbde009a43c8a97a1
