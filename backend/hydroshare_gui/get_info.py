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
from metadata_parser import MetadataParser
from collections import OrderedDict
import pandas as pd
# os.chdir(os.path.expanduser('a path')) # will change working directory


# auth - Future: get this info'
auth = HydroShareAuthBasic(username=username, password=password)
hs = HydroShare(auth=auth)

test_resource_id = 'c40d9567678740dab868f35440a69b30'

output_folder = 'backend/tests/hs_resources'
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

def get_files_JH(resource_id):
    get_hs_resource(resource_id, output_folder)
    # files = glob.glob('{}/{}/{}/data/contents/*'.format(output_folder, resource_id, resource_id))
    prefix = output_folder + "/" + resource_id + "/" + resource_id + "/data/contents"
    files2 = get_recursive_folder_contents(prefix)
    return files2

def get_folder_size(folderpath):
    total_size = 0
    for path, dirs, files in os.walk(folderpath):
        for f in files:
            fp = os.path.join(path, f)
            total_size += os.path.getsize(fp)
    return total_size

def get_recursive_folder_contents(folderpath):
    # get all the files in the folder
    files = glob.glob('{}/*'.format(folderpath))
    # return empty list if the folder is empty
    if len(files) == 0:
        return []
    files2 = []
    for filepath in files:
        # +1 is to account for / after folderpath before file name
        file = filepath[len(folderpath)+1:]
        if (len(get_recursive_folder_contents(filepath)) == 0 and
                                                file.rfind(".") != -1):
            file_type = file[file.rfind(".")+1:]
            filename = file[:file.rfind(".")]
        else:
            file_type = "folder"
            filename = file
        if file_type == "folder":
            files2.append({
                "contents": get_recursive_folder_contents(filepath),
                "dirPath": folderpath,
                "name": filename,
                "sizeBytes": get_folder_size(filepath),
                "type": file_type,
            })
        else:
            files2.append({
                "dirPath": folderpath,
                "name": filename,
                "sizeBytes": os.path.getsize(filepath),
                "type": file_type,
            })
    return files2

#TODO (vickymmcd): fix up formatting of returned list of HS files
def get_files_HS(resource_id):
    return list(hs.getResourceFileList(resource_id))

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
def create_resource_in_JH():
    pass

def rename_resource_in_JH():
    pass

def delete_resource_in_JH():
    pass

def locate_resource_in_JH():
    pass

def get_local_resources():
    resource_folders = glob.glob(os.path.join(output_folder, '*'))
    # TODO: Use a filesystem-independent way of this
    mp_by_res_id = {}
    for folder_path in resource_folders:
        res_id = folder_path.split('/')[-1]
        metadata_file_Path = os.path.join(folder_path, res_id, 'data', 'resourcemetadata.xml')
        mp = MetadataParser(metadata_file_Path)
        mp_by_res_id[res_id] = mp

    return mp_by_res_id

"""Others"""
def get_list_of_user_resources():
    resources = {}

    # Get the user's resources from HydroShare
    user_hs_resources = hs.resources(owner=username)
    for res in user_hs_resources:
        res_id = res['resource_id']
        resources[res_id] = {
            'id': res_id,
            'title': res['resource_title'],
            'hydroShareResource': res,
        }

    # Get the resources copied to the local filesystem
    local_resources = get_local_resources()
    for res_id, res_metadata in local_resources.items():
        if res_id in resources:
            # TODO: Add local files
            resources[res_id]['localCopyExists'] = True
        else:
            resources[res_id] = {
                'id': res_id,
                'title': res_metadata.get_title(),
                'hydroShareResource': res_metadata.spoof_hs_api_response(),
                'localCopyExists': True,
            }

    return list(resources.values())


def get_folder_last_modified_time(id):
    # This is where we can get folder last modified time
    metadata = hs.getScienceMetadata(id)
    # TODO: extract modified time from metadata
    return

if __name__ == '__main__':
    # get_metadata(test_resource_id)
    # get_hs_resource(test_resource_id, output_folder, unzip=True)
    # # get_files_in_directory_with_metadata()
    # # create_resource_in_HS()
    # resources = get_list_of_user_resources()
    # for r in resources:
    #     print(r["resource_id"])
    #     get_hs_resource(r["resource_id"], output_folder, unzip=True)
    #
    # print(r["resource_id"])
    # local_file = 'backend/tests/hs_resources/' + r["resource_id"] + '/' + r["resource_id"] + '/data/contents/Introduction_to_Coding.ipynb'
    # update_path = 'data/contents'
    # print(update_resource_in_HS(local_file, update_path, r["resource_id"]))
    # for file in (get_files_HS("8b826c43f55043f583c85ae312a8894f")):
    #     print(file)
    # get_user_info()
    # test_socket()

#bbc2bcea4db14f6cbde009a43c8a97a1
