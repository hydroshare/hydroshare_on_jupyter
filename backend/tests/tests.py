def test_get_hs_resource():
    # check name = ... etc.
    resource = get_hs_resource()
    assert len(resource) > 0 # :)

def test_get_files():
    files = get_files()
    assert len(files) > 0

def test_get_metadata():
    data = get_metadata()
    assert len(data) > 0

def test_get_user_info():
    info = get_user_info()
    assert len(info) > 0

def test_socket():
    # ??
    pass