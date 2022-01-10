"""
This file sets up the hydroshare server for communicating with the
hydroshare gui frontend.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# -*- coding: utf-8 -*-
from pathlib import Path
from http import HTTPStatus
import secrets
import re
from pydantic import ValidationError

from jupyter_server.base.handlers import JupyterHandler
from notebook.utils import url_path_join
from typing import Union, List, Optional
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from hsclient import HydroShare

from .models.api_models import (
    Boolean,
    Credentials,
    DataDir,
    OAuthCredentials,
    Success,
    CollectionOfResourceMetadata,
    ResourceFiles,
)
from .models.oauth import OAuthFile
from .session_struct import SessionStruct
from .session import session_sync_struct

# from .websocket_handler import FileSystemEventWebSocketHandler
from .lib.resource_factories import HydroShareEntityDownloadFactory, EntityTypeEnum


# Global singleton session wrapper. Contains:
# - hs_client.HydroShare instance
# - deciphered user cookie
# - last user activity time
# NOTE: This should be a bound composition element or collection in the future.
# The current state does not support multiple connected users.
# activity initialized at -1, ergo no connection made
SESSION = SessionStruct(session=None, cookie=None, id=None, username=None)


class SessionMixIn:
    """MixIn with methods for reading the state of the current session."""

    session_cookie_key = "user"
    # TODO: implement current user property
    # if not included, when deployed on jupyterhub, jupyterhub.log.log_request username = user.name causes crash
    current_user = ""

    def get_current_user(self):
        # @overrides BaseRequestHandler.get_current_user()
        return self.validate_session()

    def get_session(self) -> SessionStruct:
        return SESSION

    def get_hs_session(self) -> HydroShare:
        return SESSION.session

    def get_session_id(self) -> Union[int, None]:
        return SESSION.id

    def get_client_cookie(self) -> Union[bytes, None]:
        """Get deciphered cookie value from client request"""
        return self.get_secure_cookie(self.session_cookie_key)

    def get_server_cookie(self) -> Union[bytes, None]:
        """Get deciphered cookie value stored on server side"""
        return self.get_session().cookie

    def get_client_server_cookie_status(self) -> bool:
        """Return if client and server cookies match or if server cookies are outdated."""
        # server side session
        session = self.get_session()
        client_cookie = self.get_client_cookie()

        # server side cookie != client request cookie or server side cookie is outdated
        return session == client_cookie

    def validate_session(self) -> Union[bytes, None]:
        if self.get_client_server_cookie_status():
            return self.get_client_cookie()

        return None


class BaseRequestHandler(SessionMixIn, JupyterHandler):  # TODO: will need to change
    """Sets the headers for all the request handlers that extend
    this class"""

    def set_default_headers(self):
        # TODO: change from * (any server) to our specific url (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/40)
        self.set_header("Access-Control-Allow-Origin", "localhost")
        self.set_header(
            "Access-Control-Allow-Headers",
            "x-requested-with, content-type, x-xsrftoken, cookie",
        )

    def get_login_url(self) -> str:
        # NOTE: hardcoded to login path, may want to change in the future
        return "/syncApi/login"

    def prepare(self):
        # NOTE: See: https://www.tornadoweb.org/en/stable/guide/security.html#user-authentication for a potential alternative solution
        super().prepare()
        if not self.get_client_server_cookie_status():
            self.set_status(HTTPStatus.FOUND)  # 302
            # append requested uri as `next` Location parameter
            uri = self.request.uri
            self.redirect(f"{self.get_login_url()}?next={uri}")

    def options(self, _=None):
        # web browsers make an OPTIONS request to check what methods (line 31)
        # are allowed at/for an endpoint.
        self.set_status(HTTPStatus.NO_CONTENT)
        self.finish()

    def get_template_path(self) -> Optional[str]:
        """Override template path and set application specific template path. Only applies to sub-classes."""
        return Path(__file__).parent.resolve() / "templates"

    @property
    def data_path(self) -> Path:
        """Local HydroShare resources file system location."""
        return Path(self.settings.get("data_path"))

    @property
    def oauth_creds(self) -> Union[OAuthCredentials, None]:
        """Local HydroShare resources file system location."""
        creds = self.settings.get("oauth_path")  # type: OAuthFile
        # implicit None if creds **is** None
        if creds is not None:
            oauth_contents, client_id = creds
            return OAuthCredentials(token=oauth_contents, client_id=client_id)


class HeadersMixIn:
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        # [(header, value tuples), ...]
        for header, value in self._custom_headers:  # implement in child class
            self.set_header(header, value)


class MutateSessionMixIn:
    """MixIn allowing mutation current session."""

    def set_session(self, session: SessionStruct) -> None:
        global SESSION
        SESSION = session


class WebAppHandler(HeadersMixIn, BaseRequestHandler):
    """Serves up the HTML for the React web app"""

    _custom_headers = [("Access-Control-Allow-Methods", "GET, OPTIONS")]

    def prepare(self):
        # NOTE: Bypass base request prepare. This should change in the future
        pass

    def get(self):
        debug = "dev" if self.settings.get("debug", False) else "dist"

        template_kwargs = {
            "frontend_path": "/sync",
            "backend_path": "/syncApi",
            "bundle_suffix": debug,
            "getting_started_notebook_path": "",
            "notebook_url_path_prefix": None,
        }
        # NOTE: This may need to change to accommodate multiple template directories
        # when integrating with Jupyter.
        self.render("root.html", **template_kwargs)


class DataDirectoryHandler(HeadersMixIn, BaseRequestHandler):
    """Return absolute path to directory configured to store HydroShare data locally."""

    _custom_headers = [("Access-Control-Allow-Methods", "GET, OPTIONS")]

    def prepare(self):
        # NOTE: Bypass base request prepare. This should change in the future
        pass

    def get(self):
        self.write(DataDir(data_directory=str(self.data_path)).dict())


class UsingOAuth(MutateSessionMixIn, HeadersMixIn, BaseRequestHandler):
    """Return OAuthCredentials if they are specified in configuration. Field values are empty strings if
    not configured."""

    _custom_headers = [("Access-Control-Allow-Methods", "GET, OPTIONS")]

    def prepare(self):
        # NOTE: Bypass base request prepare. This should change in the future
        pass

    def get(self):
        if self.oauth_creds:
            self.write(self.oauth_creds.dict())
        else:
            # TODO: In the future, a model denoting that oauth is not enabled should be returned instead.
            empty = {
                "client_id": "",
                "token": {
                    "access_token": "",
                    "token_type": "",
                },
            }
            self.write(OAuthCredentials.parse_obj(empty).dict())


class LoginHandler(MutateSessionMixIn, HeadersMixIn, BaseRequestHandler):
    """Handles authenticating the user with HydroShare. Accepts standard auth using username and
    password or using OAuth2.

    HTTP Request type:
        DELETE:
            Action:
                logout user
        POST:
            Action:
                Login user. A cookie with key "user" is sent in response header. The
                cookie maintains the login state. The cookie is generated using an
                encrypted token consisting of the HydroShare id of the user + some
                16-bit salt. The decrypted version is stored in memory for reference.
            Body:
                Content-Type: application/json
                Schema: {"username": str, "password": str} | {"client_id": str, "token": str}
    """

    _custom_headers = [("Access-Control-Allow-Methods", "OPTIONS,POST,DELETE")]
    # instance flag indicating if a request concluded in a successful login.
    # switched in `post`. used in `on_finish` to instantiate local and remote FSMaps
    successful_login = False

    def prepare(self):
        if self.request.headers.get("Content-Type", None) != "application/json":
            return self.set_status(HTTPStatus.UNSUPPORTED_MEDIA_TYPE)

    def delete(self):
        # Ensure user is signed before destroying session
        if self.get_client_server_cookie_status():
            self._destroy_session()
        else:
            self.set_status(HTTPStatus.UNAUTHORIZED)  # 401

    def post(self):
        # NOTE: A user can login and then try to login to another account, but if they
        # do not use the DELETE method first, they will still be signed into the first
        # account bc of the `user` cookie
        credentials = Credentials.parse_raw(self.request.body.decode("utf-8"))
        self.log.info("parsed user credentials")

        self.successful_login = True
        # client and server cookies don't match or is out of date
        if not self.get_client_server_cookie_status():
            try:
                self._create_session(credentials)

            except Exception as e:
                self.successful_login = False
                self.log.exception(e)
                if "401" in str(e):
                    self.set_status(HTTPStatus.UNAUTHORIZED)  # 401
                else:
                    self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)  # 500

        # self.successful_login initialized to False in `prepare`
        self.write(Success(success=self.successful_login).dict())

    def _create_session(self, credentials: Credentials) -> None:
        hs = HydroShare(**credentials.dict())
        user_info = hs.my_user_info()
        user_id = int(user_info["id"])
        username = user_info["username"]

        # salt the user id and create salted cookie
        salt = secrets.randbits(16)
        salted_token = f"{user_id}{salt}".encode()

        # cookie is tied to session, meaning it has no expire date
        self.set_secure_cookie(self.session_cookie_key, salted_token, expires_days=None)
        self.log.info("creating session")

        self.set_session(
            SessionStruct(
                session=hs, cookie=salted_token, id=user_id, username=username
            )
        )

    def on_finish(self) -> None:
        if self.successful_login and session_sync_struct.is_empty:

            # it is possible for a user who does not send cookies with their request to "login"
            # multiple times. this is unlikely, but it is possible. additionally, logins from
            # different browser tabs may also cause result in multiple successful logins.
            # note: here, it is assumed and implicitly enforced that a user cannot be logged into
            # multiple accounts at once. in the future, this may be desirable, but at the moment
            # this is not possible. the session cookie is retains the login state. even if a user
            # logins in successfully, gets a cookie, and then logs in with a different account (but
            # sends the first session cookie) the first account will remain logged in.

            # only create new sync session if the current is empty
            # NOTE: based on the way `is_empty` is implemented, it is possible for some attrs of the
            # _SessionSyncSingleton to be empty/None and some to be present and True is returned.
            # this may come up in the future as a place where the session is corrupted.
            hs_session = self.get_hs_session()
            self.log.info("got hydroshare session")
            session_sync_struct.new_sync_session(self.data_path, hs_session)
            self.log.info("created sync session")

    def _destroy_session(self):
        # handle logout logic
        self.clear_cookie(self.session_cookie_key)
        self.set_session(
            SessionStruct(session=None, cookie=None, id=None, username=None)
        )
        # shutdown previous resources and reset session sync to initial state
        session_sync_struct.reset_session()


class ListUserHydroShareResources(HeadersMixIn, BaseRequestHandler):
    """List the HydroShare resources a user has edit permission of."""

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self):
        session = self.get_session()

        resources = list(session.session.search(edit_permission=True))

        # Marshall hsclient representation into CollectionOfResourceMetadata
        self.write(CollectionOfResourceMetadata.parse_obj(resources).json())


class ListHydroShareResourceFiles(HeadersMixIn, BaseRequestHandler):
    """List the files in a HydroShare resource."""

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self, resource_id: str):
        # used in `on_finish`
        self.resource_id = resource_id

        # NOTE: May want to sanitize input in future. i.e. require it be a min/certain length
        session = self.get_hs_session()

        # TODO: add `force` argument to force update resource checksums from hydroshare
        # implement with use_cache flag
        resource = session.resource(resource_id)
        files = [
            file
            # The file names and checksums are implicitly cached by the resource
            for file in resource._checksums.keys()
            if file.startswith("data/contents/")
        ]

        # Marshall hsclient representation into CollectionOfResourceMetadata
        self.write(ResourceFiles(files=files).json())

    def on_finish(self) -> None:
        # emit event to notify that a local resource has been listed. if there is local copy, it
        # will need to be added to aggregate map
        session_sync_struct.event_broker.dispatch(
            "RESOURCE_FILES_LISTED", self.resource_id
        )


class HydroShareResourceHandler(HeadersMixIn, BaseRequestHandler):
    """Download HydroShare resource to local file system."""

    resource_id: str
    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self, resource_id: str):
        # NOTE: May want to sanitize input in future. i.e. require it be a min/certain length
        session = self.get_hs_session()
        resource = session.resource(resource_id)

        # download resource to temp directory
        with TemporaryDirectory() as temp_dir:
            downloaded_zip = resource.download(temp_dir)
            # unzip resource
            with ZipFile(downloaded_zip, "r") as zr:
                # respect HydroShare baggit file structure convention
                # data_path / resource_id / resource_id / ...
                zr.extractall(self.data_path / resource_id)

        # set instance variable for `on_finish`
        self.resource_id = resource_id
        self.set_status(HTTPStatus.CREATED)  # 201

    def on_finish(self) -> None:
        if self.get_status() == HTTPStatus.CREATED:
            # dispatch resource downloaded event with resource_id
            session_sync_struct.event_broker.dispatch(
                "RESOURCE_DOWNLOADED", self.resource_id
            )


class HydroShareResourceEntityHandler(HeadersMixIn, BaseRequestHandler):
    """Download file or folder from HydroShare resource to local file system."""

    BAGGIT_PREFIX_RE = r"^/?data/contents/?"
    BAGGIT_PREFIX_MATCHER = re.compile(BAGGIT_PREFIX_RE)
    resource_id: str

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self, resource_id: str, path: str):
        """Use query param, `folder` with a boolean value (True, true, 1 | False, false,
        0) to indicate downloading a folder versus a file."""
        # NOTE: May want to sanitize input in future. i.e. require it be a min/certain length
        session = self.get_hs_session()
        resource = session.resource(resource_id)

        path = self._truncate_baggit_prefix(path)

        is_folder_entity = Boolean.get_value(self.get_query_argument("folder", False))

        entity_type = EntityTypeEnum.FILE
        if is_folder_entity:
            entity_type = EntityTypeEnum.FOLDER

        HydroShareEntityDownloadFactory.download(
            entity_type, resource, self.data_path, path
        )

        # set instance variable for `on_finish`
        self.resource_id = resource_id
        self.set_status(HTTPStatus.CREATED)  # 201

    def on_finish(self) -> None:
        if self.get_status() == HTTPStatus.CREATED:
            # dispatch resource entity downloaded event with resource_id
            session_sync_struct.event_broker.dispatch(
                "RESOURCE_ENTITY_DOWNLOADED", self.resource_id
            )

    @staticmethod
    def _truncate_baggit_prefix(file_path: str):
        baggit_prefix_match = (
            HydroShareResourceEntityHandler.BAGGIT_PREFIX_MATCHER.match(file_path)
        )

        if baggit_prefix_match is not None:
            # left-truncate baggit prefix path
            file_path = file_path[baggit_prefix_match.end() :]

        return file_path


class LocalResourceEntityHandler(HeadersMixIn, BaseRequestHandler):
    """Upload file or folder from local file system to existing HydroShare resource."""

    BAGGIT_PREFIX_RE = r"^/?data/contents/?"
    BAGGIT_PREFIX_MATCHER = re.compile(BAGGIT_PREFIX_RE)
    BAGGIT_PREFIX = "data/contents/"
    _ZIP_FILENAME = "__zip.zip"
    resource_id: str

    _custom_headers = [("Access-Control-Allow-Methods", "POST")]

    def prepare(self):
        super().prepare()
        if self.request.headers["Content-Type"] != "application/json":
            self.set_status(HTTPStatus.UNSUPPORTED_MEDIA_TYPE)

    def post(self, resource_id: str):
        """Upload one or more local entities (files or dirs) to existing HydroShare resource.
        File paths are passed in the request body and must reside within a downloaded HS
        resource directory inside the configured `data` directory.
        (i.e. an entity inside: ~/hydroshare/<resource-id>/data/contents/)

        The method adds the prefix `/data/contents` to each file path. If it already
        exists, it is ignored. Thus, the following are equivalent:
            - { "files": ["some-file"] }
            - { "files": ["/data/contents/some-file"] }

        HTTP Request type:
            POST:
                Action:
                    Upload local entities to existing hydroshare resource.
                Body:
                    Content-Type: application/json
                    Schema: {"files": [str] }
                    Schema Notes: List members should be relative to `data` configuration directory (i.e. "/data/contents/file").
                                  However, `~` and `..` are not allowed in provided paths and return 403 status.
                                  (i.e. "data/contents/../../" is not allowed)
        """
        # TODO: Add the ability to version data
        try:
            # Marshall request body
            files = ResourceFiles.parse_raw(self.request.body.decode("utf-8")).files

        except ValidationError:
            # fail fast
            return self.set_status(HTTPStatus.FORBIDDEN)

        session = self.get_hs_session()
        # create resource object. Will fail if invalid/user does not have access.
        resource = session.resource(resource_id)

        files = self._add_baggit_prefix_and_drop_nonexistant_files(resource_id, files)
        resource_path_prefix = self.data_path / f"{resource_id}/{resource_id}"

        with TemporaryDirectory() as temp_dir:
            zip_file = Path(temp_dir) / self._ZIP_FILENAME

            # create zip archive
            with ZipFile(zip_file, "w") as zipped:
                for file in files:
                    zipped.write(
                        file,
                        # maintain file system structure relative to where data is stored in baggit (/data/contents/)
                        # Example: `/data/contents/dir1/some-file.txt` will be archived in the zip at, `/dir1/some-file.txt`
                        file.relative_to(resource_path_prefix / self.BAGGIT_PREFIX),
                    )

                # upload zip to HydroShare
                resource.file_upload(zip_file)
                self._unpack_zip_on_hydroshare(resource, zip_file.name)

        # set instance variable for `on_finish`
        self.resource_id = resource_id
        self.set_status(HTTPStatus.CREATED)  # 201

    def on_finish(self) -> None:
        if self.get_status() == HTTPStatus.CREATED:
            # dispatch resource uploaded event with resource_id
            session_sync_struct.event_broker.dispatch(
                "RESOURCE_ENTITY_UPLOADED", self.resource_id
            )

    def _unpack_zip_on_hydroshare(
        self, resource, filename: str, location: str = ""
    ) -> None:
        # unpack and delete zip
        unzip_path = url_path_join(
            resource._hsapi_path,
            "functions",
            "unzip",
            "data",
            "contents",
            location,
            filename,
        )
        # post job to HydroShare
        resource._hs_session.post(
            unzip_path,
            status_code=200,
            data={"overwrite": "true", "ingest_metadata": "true"},
        )

    def _add_baggit_prefix_and_drop_nonexistant_files(
        self, resource_id: str, files: List[str]
    ) -> List[Path]:
        # prepend baggit prefix, files/dirs that don't exist are dropped
        resource_path_prefix = self.data_path / f"{resource_id}/{resource_id}"
        return [
            resource_path_prefix / self._prepend_baggit_prefix(f)
            for f in files
            if (resource_path_prefix / self._prepend_baggit_prefix(f)).exists()
        ]

    @staticmethod
    def _truncate_baggit_prefix(file_path: str) -> str:
        baggit_prefix_match = LocalResourceEntityHandler.BAGGIT_PREFIX_MATCHER.match(
            file_path
        )

        if baggit_prefix_match is not None:
            # left-truncate baggit prefix path
            file_path = file_path[baggit_prefix_match.end() :]

        return file_path

    @staticmethod
    def _prepend_baggit_prefix(file_path: str) -> str:
        # remove existing prefix to sanitize the input
        left_truncated_path = LocalResourceEntityHandler._truncate_baggit_prefix(
            file_path
        )

        return f"{LocalResourceEntityHandler.BAGGIT_PREFIX}{left_truncated_path}"


class UserInfoHandler(HeadersMixIn, BaseRequestHandler):
    """Get user information from HydroShare"""

    _custom_headers = [("Access-Control-Allow-Methods", "GET, OPTIONS")]

    def get(self):
        """Gets the user's information (name, email, etc) from HydroShare"""
        session = self.get_session()
        user = session.session.user(session.id).dict()
        self.write(user)
