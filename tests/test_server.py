from tornado.httpclient import HTTPRequest, HTTPResponse
from tornado.httputil import HTTPHeaders
from hsclient import HydroShare
from hydroshare_on_jupyter.__main__ import get_test_app
from hydroshare_on_jupyter.hydroshare_resource_cache import (
    HydroShareWithResourceCache,
)
from hydroshare_on_jupyter.server import LocalResourceEntityHandler
from hydroshare_on_jupyter.session import _SessionSyncSingleton
import json
import pytest
from dataclasses import dataclass
from http.cookies import SimpleCookie, Morsel
from typing import Union


def my_user_info_mock(*args, **kwargs):
    return {"id": 42, "username": "test"}


def get_user_cookie(headers: HTTPHeaders) -> Union[Morsel, None]:
    cookies = headers.get_list("set-cookie")
    cookie = SimpleCookie()
    if cookies:
        cookie.load(cookies[0])
        user_cookie = cookie.get("user")
        if user_cookie is not None:
            return f"{user_cookie.key}={user_cookie.value};"
    return None


def get_user_cookie_from_http_response(response: HTTPResponse):
    response_cookie = get_user_cookie(response.headers)
    return response_cookie


@pytest.fixture
def app():
    return get_test_app()


@pytest.fixture
async def mocked_login_session(http_client, base_url, monkeypatch):
    body = {"username": "test", "password": "test"}
    monkeypatch.setattr(HydroShare, "my_user_info", my_user_info_mock)
    monkeypatch.setattr(HydroShareWithResourceCache, "my_user_info", my_user_info_mock)
    monkeypatch.setattr(_SessionSyncSingleton, "is_empty", False)

    req = HTTPRequest(
        base_url + "/syncApi/login",
        method="POST",
        body=json.dumps(body),
        headers={"content-type": "application/json"},
    )
    response = await http_client.fetch(req)
    return response


@pytest.mark.gen_test
async def test_login(mocked_login_session):
    response = await mocked_login_session
    assert json.loads(response.body.decode("utf-8")) == {"success": True}


@pytest.mark.gen_test
async def test_login_then_login_with_another_account(
    mocked_login_session, http_client, base_url
):
    response = await mocked_login_session  # type: HTTPResponse
    assert json.loads(response.body.decode("utf-8")) == {"success": True}

    # first login was successful, so subsequent calls to login ignore passed credentials
    body = {"username": "", "password": ""}
    response_cookie = get_user_cookie_from_http_response(response)
    wrapper_cookie = {"Cookie": response_cookie, "content-type": "application/json"}

    req = HTTPRequest(
        base_url + "/syncApi/login",
        method="POST",
        body=json.dumps(body),
        headers=wrapper_cookie,
    )

    response = await http_client.fetch(req)
    assert json.loads(response.body.decode("utf-8")) == {"success": True}

    # should not get a response header if user is already signed in
    assert get_user_cookie_from_http_response(response) == None


@pytest.mark.gen_test
async def test_valid_logout(mocked_login_session, http_client, base_url):
    response = await mocked_login_session  # type: HTTPResponse
    response_cookie = get_user_cookie_from_http_response(response)
    wrapper_cookie = {"Cookie": response_cookie, "content-type": "application/json"}

    req = HTTPRequest(
        base_url + "/syncApi/login",
        method="DELETE",
        headers=wrapper_cookie,
    )
    response = await http_client.fetch(req)
    # assert successfully logged out
    assert response.code == 200

    body = {"username": "", "password": ""}

    req = HTTPRequest(
        base_url + "/syncApi/login",
        method="POST",
        body=json.dumps(body),
        headers=wrapper_cookie,
    )
    response = await http_client.fetch(req)

    second_response_cookie = get_user_cookie_from_http_response(response)

    # assert request after logout created new cookie
    assert response_cookie != second_response_cookie


@pytest.mark.gen_test
async def test_invalid_logout(http_client, base_url):
    req = HTTPRequest(
        base_url + "/syncApi/login",
        method="DELETE",
    )
    response = await http_client.fetch(req, raise_error=False)
    # assert an UNAUTHORIZED status
    assert response.code == 401


@pytest.mark.gen_test
async def test_redirect_to_login_if_not_logged_in(http_client, base_url):
    # In theory, each endpoint that is not the login endpoint should be checked
    login_url = "/syncApi/login"
    uri = "/syncApi/user"
    req = HTTPRequest(
        base_url + uri,
        method="GET",
        # disable redirects
        follow_redirects=False,
    )
    response = await http_client.fetch(req, raise_error=False)  # type: HTTPResponse

    # assert FOUND status code
    assert response.code == 302
    # assert redirect to login prepended to uri request
    assert response.headers["location"] == f"{login_url}?next={uri}"


TRUNCATE_BAGGIT_PREFIX_TEST_DATA = [
    # Tuple[test: str, validation: str]
    ("data/contents/file", "file"),
    ("/data/contents/file", "file"),
    # TODO: Fix BAGGIT_PREFIX_RE regex to cover this case.
    ("/data/contentsfile", "file"),
    ("/data/contents/dir/file", "dir/file"),
]


@pytest.mark.parametrize("test,validation", TRUNCATE_BAGGIT_PREFIX_TEST_DATA)
def test__truncate_baggit_prefix(test, validation):

    assert LocalResourceEntityHandler._truncate_baggit_prefix(test) == validation


BAGGIT_PREFIX = LocalResourceEntityHandler.BAGGIT_PREFIX
TRUNCATE_BAGGIT_PREPEND_TEST_DATA = [
    # Tuple[test: str, validation: str]
    (
        f"{BAGGIT_PREFIX}file",
        f"{BAGGIT_PREFIX}file",
    ),
    (
        f"{BAGGIT_PREFIX}dir/file",
        f"{BAGGIT_PREFIX}dir/file",
    ),
    (
        "file",
        f"{BAGGIT_PREFIX}file",
    ),
    (
        "dir/file",
        f"{BAGGIT_PREFIX}dir/file",
    ),
]


@pytest.mark.parametrize("test,validation", TRUNCATE_BAGGIT_PREPEND_TEST_DATA)
def test__prepend_baggit_prefix(test, validation):
    assert LocalResourceEntityHandler._prepend_baggit_prefix(test) == validation
