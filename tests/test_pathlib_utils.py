import pytest
import os

from hydroshare_on_jupyter.utilities import pathlib_utils

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

    path = pathlib_utils.expand_and_resolve(test)
    # remove drive letter if it exists in path (windows) for comparison
    if path.drive:
        # this is the case on windows
        path = path.relative_to(path.drive)
        # change the path to unix-like
        path = path.as_posix()

    assert str(path) == validation


TEST_IS_DESCENDANT = [
    # child, parent, validation
    ("~/test/some-file", "~/test", True),
    ("/test/some-file", "/test", True),
    ("~/test/../tests/some-file", "~/test", True),
    ("/test/../tests/some-file/..", "/test", True),
    ("/test/../some-file/..", "/test", False),
    ("~/test/../", "~/test", False),
    ("/test/../", "/test", False),
    ("~/../test/../", "~", False),
]


@pytest.mark.parametrize("child,parent,validation", TEST_IS_DESCENDANT)
def test_is_descendant(child, parent, validation):
    # See test_expand_and_resolve for explanation
    os.environ["HOME"] = os.environ["USERPROFILE"] = "/user"

    result = pathlib_utils.is_descendant(child, parent)
    assert result is validation
