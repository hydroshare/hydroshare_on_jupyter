import pytest
import os

from hydroshare_jupyter_sync.utilities import pathlib_utils

TEST_EXPAND_AND_RESOLVE_CASES = [
    ("~/test", "/test_user/test", "/test_user"),
    ("~/test/another/test", "/test_user/test/another/test", "/test_user"),
]


@pytest.mark.parametrize("test,validation,user", TEST_EXPAND_AND_RESOLVE_CASES)
def test_expand_and_resolve(test, validation, user):
    # mock user. See below documentation for cross-platform support
    # https://docs.python.org/3/library/os.path.html#os.path.expanduser

    # unix-like os use `HOME`. Windows use `USERPROFILE`
    os.environ["HOME"] = os.environ["USERPROFILE"] = user

    assert str(pathlib_utils.expand_and_resolve(test)) == validation
