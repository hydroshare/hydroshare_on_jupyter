from tornado.httpclient import HTTPRequest, HTTPClient, HTTPResponse
from tornado.httputil import HTTPHeaders
from hsclient import HydroShare
from hydroshare_jupyter_sync.__main__ import get_test_app
import json
import pytest
from dataclasses import dataclass
from http.cookies import SimpleCookie, Morsel
from typing import Union


def my_user_info_mock(*args, **kwargs):
    return {"id": 42}


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

    req = HTTPRequest(base_url + "/syncApi/login", method="POST", body=json.dumps(body))
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
    wrapper_cookie = {"Cookie": response_cookie}

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
    wrapper_cookie = {"Cookie": response_cookie}

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
    uri = "/"
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
