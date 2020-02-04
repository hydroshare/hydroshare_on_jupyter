# potato (vicky): seems like test_server.py does most of the things we want -
# maybe we can remove this file?
from get_info import get_hs_resource, get_files, get_metadata, get_user_info


test_resource_id = '8b826c43f55043f583c85ae312a8894f'
output_folder = 'hs_resources'

def test_get_hs_resource():
    # check name = ... etc.
    resource = get_hs_resource(test_resource_id, output_folder)
    assert len(resource) > 0 # :)

def test_get_files():
    files = get_files()
    assert len(files) > 0

def test_get_metadata():
    data = get_metadata(test_resource_id)
    assert len(data) > 0

def test_get_user_info():
    info = get_user_info()
    assert len(info) > 0

def test_server():
    # ??
    pass

if __name__ == '__main__':
    test_get_hs_resource()
    test_get_files()
    test_get_metadata()
    test_get_user_info()
    test_socket()
