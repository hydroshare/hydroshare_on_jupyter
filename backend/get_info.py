# TODO
# - get hs resource
# - get files
# - get metadata
# - get user info

### This works for public resources
from hs_restclient import HydroShare, HydroShareAuthBasic
from pprint import pprint
from login import username, password

# auth - Future: get this info'
auth = HydroShareAuthBasic(username=username, password=password)
hs = HydroShare(auth=auth)

test_resource_id ='c40d9567678740dab868f35440a69b30'
output_folder = 'hs_resources'

def get_hs_resource(resource_id, output_folder, unzip_bool=False):
    # Get actual resource
    print("getting hs resource")
    hs.getResource(resource_id, destination=output_folder, unzip=unzip_bool)

def get_files():
    # look at nb fetch for this
    pass

def get_metadata(resource_id):
    # get metadata for one resource
    print("getting hs resource metadata")
    resource_md = hs.getSystemMetadata(resource_id)
    print(resource_md['resource_title'])
    pprint(resource_md)

def get_user_info():
    # username
    pass

def test_socket():
    pass

get_metadata(test_resource_id)
get_hs_resource(test_resource_id, output_folder)
get_files()
get_user_info()
test_socket()