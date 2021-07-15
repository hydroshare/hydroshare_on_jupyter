import pytest
from hydroshare_jupyter_sync.session_struct import SessionStruct


@pytest.fixture
def empty_session_struct():
    return SessionStruct(session=None, cookie=None)


@pytest.fixture
def empty_session_with_cookie_struct():
    return SessionStruct(session=None, cookie=b"test")


def test_eq_empty(empty_session_struct):
    assert empty_session_struct != empty_session_struct


def test_eq(empty_session_with_cookie_struct):
    assert empty_session_with_cookie_struct == empty_session_with_cookie_struct
    assert empty_session_with_cookie_struct == b"test"