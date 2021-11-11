"""
This file sets up the hydroshare server for communicating with the
hydroshare gui frontend.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# -*- coding: utf-8 -*-
import json
import logging
import os
import signal
import sys
from pathlib import Path
from http import HTTPStatus
import secrets
import re
import shutil
from pydantic import ValidationError

import requests
import datetime
import tornado.ioloop
import tornado.options
import tornado.web
from hs_restclient import exceptions as HSExceptions
from notebook.base.handlers import IPythonHandler
from jupyter_server.base.handlers import JupyterHandler
from notebook.utils import url_path_join
from typing import Union, List, Optional
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from hsclient import HydroShare
from .hydroshare_resource_cache import HydroShareWithResourceCache

from .config_reader_writer import (
    get_config_values,
    set_config_values,
)
from .credential_reader_writer import credential_path
from .index_html import get_index_html
from .resource_hydroshare_data import (
    ResourceHydroShareData,
    HS_PREFIX,
)
from .resource_local_data import ResourceLocalData, LOCAL_PREFIX
from .resource_manager import (
    ResourceManager,
    HYDROSHARE_AUTHENTICATION_ERROR,
)

from .models.api_models import (
    Boolean,
    Credentials,
    DataDir,
    OAuthCredentials,
    Success,
    CollectionOfResourceMetadata,
    ResourceFiles,
)
from .models.oauth import OAuthContents, OAuthFile
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

resource_manager = ResourceManager()

_log = logging.getLogger(__name__)

WORKSPACE_FILES_ERROR = {
    "type": "WorkspaceFileError",
    "message": "HydroShare files not present in Workspace",
}

# TODO: These are constants, so change case
# also, this should be moved to the config setup
assets_path = Path(__file__).absolute().parent / "assets"
data_path = Path.cwd() / "hydroshare" / "local_hs_resources"

isFile = False
# If we're running this file directly with Python, we'll be firing up a full
# Tornado web server, so use Tornado's RequestHandler as our base class.
# Otherwise (i.e. if this is being run by a Jupyter notebook server) we want to
# use IPythonHandler as our base class. (See the code at the bottom of this
# file for the server launching.)
# NOTE: Given that IPythonHandler is a subclass of tornado.web.RequestHandler, I don't
# think it is an issue to use it as the base class. This may come up in the future and
# need to be changed.
# BaseHandler = tornado.web.RequestHandler if __name__ == "__main__" else IPythonHandler


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
            return OAuthCredentials(
                token=oauth_contents["access_token"], client_id=client_id
            )


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
            self.write(OAuthCredentials(client_id="", token="").dict())


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


# NOTE: deprecated
class Localmd5Handler(HeadersMixIn, BaseRequestHandler):
    """Handles calculation of local md5 values"""

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self, res_id):
        # TODO: Add schema. Is this a string, bytes, int?
        local_data = ResourceLocalData(res_id)

        local_data.get_md5(res_id)

        # TODO: add output schema. Something like: Might can use subset of output schema from LoginHandler
        # { "success" : "string",
        #   "userInfo" : "string",
        # }
        self.write(
            {
                "success": "success",
                "userInfo": "",
            }
        )


# NOTE: deprecated
class Hsmd5Handler(HeadersMixIn, BaseRequestHandler):
    """Handles calculation of local md5 values"""

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    # NOTE: How is this different from Localmd5Handler?

    def get(self, res_id):
        # NOTE: This is not implemented. Should it be?
        # TODO: Add schema. Is this a string, bytes, int?
        diff_overall = True

        # TODO: add output schema. Something like:
        self.write({"success": diff_overall})


class ListUserHydroShareResources(HeadersMixIn, BaseRequestHandler):
    """List the HydroShare resources a user has edit permission of."""

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self):
        session = self.get_session()

        resources = list(session.session.search(edit_permission=True))

        # Marshall hsclient representation into CollectionOfResourceMetadata
        self.write(CollectionOfResourceMetadata.parse_obj(resources).json())

    # # TODO: This should be moved to its own endpoint
    # def post(self):
    #     """
    #     Makes a new resource with the bare minimum amount of information

    #     Expects body:
    #     {"resource title": string
    #     "creators": list of strings}
    #     """
    #     # TODO: IMO, this endpoint is not needed for the MVP
    #     # TODO: Add schema validation
    #     # {
    #     #   "title": {"type": "string"},
    #     #   "creators": {"type": "list", "schema": "string"}
    #     #
    #     #
    #     # }
    #     body = json.loads(self.request.body.decode("utf-8"))
    #     resource_title = body.get("title")
    #     creators = body.get("creators")  # list of names (strings)
    #     abstract = body.get("abstract")
    #     privacy = body.get("privacy", "Private")  # Public or private

    #     if resource_title is None or creators is None:
    #         self.set_status(400)
    #         self.write(
    #             {
    #                 "success": False,
    #                 "error": {
    #                     "type": "InvalidRequest",
    #                     "message": (
    #                         "The request body must specify " '"title" and "creators".'
    #                     ),
    #                 },
    #             }
    #         )
    #     else:
    #         resource_id, error = resource_manager.create_HS_resource(
    #             resource_title, creators, abstract, privacy
    #         )
    #         self.write(
    #             {
    #                 "resource_id": resource_id,
    #                 "success": error is None,
    #                 "error": error,
    #             }
    #         )


class ListHydroShareResourceFiles(HeadersMixIn, BaseRequestHandler):
    """List the files in a HydroShare resource."""

    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self, resource_id: str):
        # NOTE: May want to sanitize input in future. i.e. require it be a min/certain length
        session = self.get_hs_session()

        resource = session.resource(resource_id)
        files = [
            file
            # The file names and checksums are implicitly cached by the resource
            for file in resource._checksums.keys()
            if file.startswith("data/contents/")
        ]

        # Marshall hsclient representation into CollectionOfResourceMetadata
        self.write(ResourceFiles(files=files).json())


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
                zr.extractall(self.data_path)

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


# NOTE: deprecated
class ResourceHandler(HeadersMixIn, BaseRequestHandler):
    """Handles resource-specific requests made to /resources/<resource_id>"""

    _custom_headers = [("Access-Control-Allow-Methods", "DELETE, OPTIONS")]

    # TODO: Change name to be more representative
    # NOTE: Does this mean delete it locally or on HS?
    # NOTE: I am curious if it's possible to leverage jupyter's file browser here to do
    # the lifting?
    # TODO: Split into two endpoints if we want to support deleting on hydroshare and locally

    def delete(self, res_id):
        # TODO: Needs a schema
        body = json.loads(self.request.body.decode("utf-8"))
        del_locally_only = body.get("locallyOnly", True)
        error = resource_manager.delete_resource_locally(res_id)
        if not error and not del_locally_only:
            error = resource_manager.delete_resource_from_hs(res_id)

        self.write(
            {
                "success": error is None,
                "error": error,
            }
        )


# NOTE: deprecated
class DirectorySelectorHandler(HeadersMixIn, BaseRequestHandler):
    """Handles downloading of hydroshare data in user selected directory"""

    _custom_headers = [("Access-Control-Allow-Methods", "POST")]

    def post(self):
        returnValue = ""
        isFile = False
        dirpathinfo = json.loads(self.request.body.decode("utf-8"))
        # NOTE: Ensure that path is descendent of specified root dir in config. Meaning /home/hydroshare,
        # here, you could not go outside of the hydroshare directory.
        directoryPath = dirpathinfo["dirpath"]
        choice = dirpathinfo["choice"]

        # NOTE: what does this do?
        self.dirdetails = Path(Path.home() / "hydroshare" / "dirinfo.json")
        ##
        ##if not self.directoryPath.is_dir():
        # Let any exceptions that occur bubble up
        #  self.dirdetails.mkdir(parents=True)

        # if self.dirdetails.is_dir():
        # isFile = True

        try:
            if choice == "No":
                hydroshare = "hydroshare"
                # NOTE: Should not be an instance method
                returnValue = self.createDirectory(Path.home() / hydroshare)
                self.dirdetails.mkdir(parents=True)
                isFile = True

            elif choice == "Yes":
                dpath = Path(directoryPath)

                if not dpath.exists():
                    returnValue = (
                        "Directory path is not valid, please check if directory exists"
                    )

                elif os.access(dpath, os.W_OK):
                    returnValue = self.createDirectory(dpath)
                    self.dirdetails.mkdir(parents=True)
                    isFile = True

                else:
                    returnValue = "Permission Denied"

        # TODO: Make more specific
        except Exception as e:

            returnValue = "Error while setting the file path "

        # TODO: don't read again. These should be in the context somehow
        config = get_config_values(["dataPath"])

        if "dataPath" in config:
            config_data_path = str(config["dataPath"])
            config_new_path = config_data_path.replace(str(Path.home()), "")

            notebook_url_path_prefix = url_path_join("/tree", config_new_path)

        # TODO: fail faster and include output schema
        if returnValue != "":
            self.write(
                {
                    "error": returnValue,
                }
            )
        else:
            self.write(
                {
                    "success": "Configuration saved successfully.",
                    "isFile": isFile,
                    "configDataPath": notebook_url_path_prefix,
                }
            )

    def createDirectory(self, defaultPath):
        # NOTE: This method should be removed or moved to a non-instance method. There is no
        # need in it being an instance method.
        returnValue = ""
        localhsResources = "local_hs_resources"

        # TODO: remove hard coded path's. This should be handled by the global logger
        logpath = Path.home() / "hydroshare" / "sync.log"
        saved_successfully = set_config_values(
            {"dataPath": str(defaultPath / localhsResources), "logPath": str(logpath)}
        )
        if saved_successfully:

            # TODO: Remove. Not used.
            resource_manager = ResourceManager()
        else:

            returnValue = "Cannot set data Path values in config file"
        return returnValue


# NOTE: deprecated
class ResourceLocalFilesRequestHandler(HeadersMixIn, BaseRequestHandler):
    """Facilitates getting, deleting, and uploading to the files contained in
    a resource on the local disk"""

    _custom_headers = [("Access-Control-Allow-Methods", "DELETE, GET, POST, PUT")]

    # TODO: use module level logging
    logging.info("Resource local Handler Class is called")

    def get(self, res_id):
        # TODO: add input schema

        # Handling authentication first to ensure local data if not present is downloaded from Hydroshare

        # NOTE: Seems like a static method could be used to check if a resource exists or not
        local_data = ResourceLocalData(res_id)

        if not local_data.is_downloaded():
            resource_manager.save_resource_locally(res_id)

        # TODO: add output schema
        self.write(
            {
                "readMe": local_data.get_readme(),
                "rootDir": local_data.get_files_and_folders(),
            }
        )

    # TODO: move some of the logic here outside this file and deduplicate
    # code (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/41)
    def delete(self, res_id):
        # NOTE: is this a local deletion with no update to hydroshare?
        # TODO: input schema

        body = json.loads(self.request.body.decode("utf-8"))
        file_and_folder_paths = body.get("files")

        if file_and_folder_paths is None:
            self.set_status(400)  # Bad Request
            self.write('Could not find "files" in request body.')
            return

        local_folder = ResourceLocalData(res_id)
        success_count = 0
        failure_count = 0

        # Keep track of the folders that have been deleted so we don't try to
        # delete child files that have already
        # been deleted
        deleted_folders = []

        results = []
        for item_path in file_and_folder_paths:
            # Remove any leading /
            if item_path.startswith("/"):
                item_path = item_path[1:]
            try:
                for deleted_folder in deleted_folders:
                    # Check if this file is in a folder that was deleted (a
                    # slash is appended to ensure that a file in,
                    # say, '/My data 2' is not skipped because '/My data' was
                    # deleted)
                    if item_path.startswith(deleted_folder + "/"):
                        # We can skip deleting this file because it was already
                        # deleted with its parent folder
                        break
                else:  # Only runs if the break statement above is never hit
                    # (yes, the indentation is right here)
                    # Try to delete this item
                    deleted_type = local_folder.delete_file_or_folder(item_path)
                    if deleted_type == "folder":
                        deleted_folders.append(item_path)
                success_count += 1
                results.append({"success": True})
            except Exception as e:
                logging.error(e)
                results.append(
                    {
                        "success": False,
                        "error": {
                            "type": "UnknownError",
                            "message": (
                                f"An unknown error occurred when "
                                f"attempting to delete {item_path}."
                            ),
                        },
                    }
                )
                failure_count += 1

        # NOTE: Needs output schema
        self.write(
            {
                "results": results,
                "successCount": success_count,
                "failureCount": failure_count,
            }
        )

    def put(self, res_id):
        """Creates a new file in the local copy of the resource

        :param res_id: the resource ID
        :type res_id: str
        """
        # TODO: input schema

        body = json.loads(self.request.body.decode("utf-8"))
        item_type = body.get("type")
        name = body.get("name")
        error_msg = None
        if item_type is None or name is None:
            error_msg = 'Request must include both "type" and "name" ' "attributes."
        if not error_msg and not (item_type == "file" or item_type == "folder"):
            error_msg = '"type" attribute must be either "file" or "folder".'
        if error_msg:
            self.set_status(400)  # Bad Request
            self.write(
                {
                    "success": False,
                    "error": {
                        "type": "InvalidRequest",
                        "message": error_msg,
                    },
                }
            )
            return

        local_data = ResourceLocalData(res_id)
        if item_type == "file":
            local_data.create_file(name)
        elif item_type == "folder":
            local_data.create_local_folder(name)

        # TODO: Output schema
        self.write(
            {
                "success": True,
            }
        )

    def post(self, res_id):
        """Uploads a file from the user's computer to the local filesystem

        :param res_id: the resource ID
        :type res_id: str
        """
        # TODO: input schema

        local_data = ResourceLocalData(res_id)
        for field_name, files in self.request.files.items():
            for info in files:
                with open(str(local_data.data_path / info["filename"]), "wb") as f:
                    f.write(info["body"])
        # TODO: output schema
        self.write(
            {
                "success": True,
            }
        )


# NOTE: deprecated
class ResourceHydroShareFilesRequestHandler(HeadersMixIn, BaseRequestHandler):
    """Handles getting and deleting the files in a HydroShare resource"""

    _custom_headers = [("Access-Control-Allow-Methods", "DELETE, GET")]

    def get(self, res_id):
        hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
        # Code for updating the latest files on Root Dir object

        # local_data = ResourceLocalData(res_id)

        hydroshare_data = hs_data.get_files()
        checkHydroShareSyncStatus(hydroshare_data, res_id, False)

        self.write({"rootDir": hydroshare_data})

    # TODO: Move the bulk of this function out of this file and
    # deduplicate code (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/41)
    def delete(self, res_id):
        data = json.loads(self.request.body.decode("utf-8"))
        file_and_folder_paths = data.get("files")
        if file_and_folder_paths is None:
            self.set_status(400)  # Bad Request
            self.write('Could not find "files" in request body.')
            return

        hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
        success_count = 0
        failure_count = 0

        # Keep track of the folders that have been deleted so we don't try to
        # delete child files that have already
        # been deleted
        deleted_folders = []

        results = []
        for item_path in file_and_folder_paths:
            # Remove any leading /
            if item_path.startswith("/"):
                item_path = item_path[1:]
            try:
                for deleted_folder in deleted_folders:
                    # Check if this file is in a folder that was deleted (a
                    # slash is appended to ensure that a file in,
                    # say, '/My data 2' is not skipped because '/My data'
                    # was deleted)
                    if item_path.startswith(deleted_folder + "/"):
                        # We can skip deleting this file because it was already
                        # deleted with its parent folder
                        break
                else:  # Only runs if the break statement above is never hit
                    # (yes, the indentation is right here)
                    # Try to delete this item
                    deleted_type = hs_data.delete_file_or_folder(item_path)
                    if deleted_type == "folder":
                        deleted_folders.append(item_path)
                success_count += 1
                results.append({"success": True})
            except HSExceptions.HydroShareNotFound:
                results.append(
                    {
                        "success": False,
                        "error": {
                            "type": "NotFoundError",
                            "message": f"Could not find {item_path} in " "HydroShare.",
                        },
                    }
                )
            except HSExceptions.HydroShareNotAuthorized:
                results.append(
                    {
                        "success": False,
                        "error": {
                            "type": "NotAuthorizedError",
                            "message": (
                                f"Could not delete {item_path}. Do you "
                                "have write access to the resource?"
                            ),
                        },
                    }
                )
            except Exception as e:
                # TODO: move to module level logging
                logging.error(e)
                results.append(
                    {
                        "success": False,
                        "error": {
                            "type": "UnknownError",
                            "message": (
                                f"An unknown error occurred when"
                                " attempting to delete {item_path}."
                            ),
                        },
                    }
                )
                failure_count += 1

        self.write(
            {
                "results": results,
                "successCount": success_count,
                "failureCount": failure_count,
            }
        )


MOVE = "move"
COPY = "copy"


# NOTE: deprecated
class DownloadHydroShareFilesRequestHandler(HeadersMixIn, BaseRequestHandler):
    _custom_headers = [("Access-Control-Allow-Methods", "POST")]

    def post(self, res_id):
        hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
        data = json.loads(self.request.body.decode("utf-8"))

        file_and_folder_paths = data.get("files")
        # TODO: unused
        filesChanged = "sync"

        if file_and_folder_paths is None:
            self.set_status(400)  # Bad Request
            self.write('Could not find "files" in request body.')
            return
        for item_path in file_and_folder_paths:
            # Remove any leading /
            if item_path.startswith("/"):
                item_path = item_path[1:]

                local_data = ResourceLocalData(res_id)
                # resource_manager.save_file_locally(res_id, item_path)
                hs_data.download_to_local(local_data, Path(item_path), Path(item_path))

        self.write(
            {
                "readMe": local_data.get_readme(),
                "rootDir": local_data.get_files_and_folders(),
            }
        )


# NOTE: deprecated
def checkFileSyncStatus(temporaryRoot, res_id):
    serverIsLatest = "HydroShare is latest"
    localIsLatest = "Local is Latest"
    localSyncServer = "In Sync"
    isfileExists = ""
    local_data = ResourceLocalData(res_id)
    hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
    # find where are the files and its properties in temporaryRoot
    contents = temporaryRoot["contents"]
    for file in contents:

        modified_time_local = file["modifiedTime"]
        checksum_local = file["checksum"]

        checksum_hs, modified_time_hs = hs_data.get_modified_time_hs(file["name"])

        if checksum_hs == None or modified_time_hs == None:
            syncStatus = " "
            isfileExists = "File doesn't exist in HydroShare"
            file.update({"fileChanged": isfileExists, "syncStatus": syncStatus})
        else:
            if checksum_local != checksum_hs:
                syncStatus = "Out of Sync"
                if modified_time_hs < modified_time_local:
                    # add fileChanged value
                    file.update(
                        {"fileChanged": localIsLatest, "syncStatus": syncStatus}
                    )

                elif modified_time_hs > modified_time_local:
                    file.update(
                        {"fileChanged": serverIsLatest, "syncStatus": syncStatus}
                    )

            elif checksum_local == checksum_hs:
                syncStatus = "In Sync"
                file.update(
                    {
                        "fileChanged": "Local and HydroShare are synced",
                        "syncStatus": syncStatus,
                    }
                )

    temporaryRoot = sorted(contents, key=lambda x: x["syncStatus"] == " ")


# NOTE: deprecated
def checkHydroShareSyncStatus(local_or_hs_file_data, res_id, is_local_data):
    serverIsLatest = "HydroShare is latest"
    localIsLatest = "Local is Latest"
    # TODO: unused
    localSyncServer = "In Sync"
    isFileExist = ""

    # TODO: move docstring
    """
    if its localdata then get hydroshare data for the res_id
    else if hydrosharedata then get local data for the res_id
    """
    if is_local_data:
        data_to_compare = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
    else:
        data_to_compare = ResourceLocalData(res_id)

    data_to_check_sync_status = local_or_hs_file_data["contents"]

    for data in data_to_check_sync_status:
        addParameters(
            data, data_to_compare, localIsLatest, serverIsLatest, res_id, is_local_data
        )


# NOTE: deprecated
def addParameters(
    data, data_to_compare, localIsLatest, serverIsLatest, res_id, is_local_data
):
    # First iterate through folders, and then recrusively call the same method for each file.
    if data["type"] == "folder":
        for k, v in data.items():
            if k == "contents":
                for j in v:
                    addParameters(
                        j,
                        data_to_compare,
                        localIsLatest,
                        serverIsLatest,
                        res_id,
                        is_local_data,
                    )
    else:
        """
        TODO: Soumya
        If checksum present for
           local file - then local file exist
           hydroshare file - then file exist in Hydroshare server

        If checksum matches
           Then both files are in sync
        Else
           If they are not in sync, then check their last update time and identify which is latest.

        Sync status is dependent upon checksum. So, if checksum is present for both, then the file exist in both HS and local.
        if local file doesnt have checksum the file is no

        """
        # Identify if its Hydroshare file or local file
        if data["path"].startswith("hs"):
            file_name = data["path"][4:]
        else:
            file_name = data["path"][7:]

        # Get checksum for both Hydroshare and local files

        if is_local_data:
            item_path = str(ResourceLocalData(res_id).data_path) + "/" + file_name
            checksum_local = ResourceLocalData(res_id).get_md5_files(item_path)
            checksum_hs = data_to_compare.checksum_hs(
                file_name.partition(".")[0], file_name.partition(".")[2]
            )
            modified_time_local = str(
                datetime.datetime.fromtimestamp(Path(item_path).stat().st_mtime)
            )
            modified_time_hs = data_to_compare.modified_time_hs(
                file_name.partition(".")[0], file_name.partition(".")[2]
            )

        else:
            item_path = str(data_to_compare.data_path) + "/" + file_name
            checksum_local = data_to_compare.get_md5_files(item_path)
            modified_time_local = None
            if Path(item_path).exists():
                modified_time_local = str(
                    datetime.datetime.fromtimestamp(Path(item_path).stat().st_mtime)
                )
            checksum_hs = data["checksum"]
            modified_time_hs = data["modifiedTime"]

        syncStatus = " "

        if checksum_local is None:
            isFileExist = "File doesn't exist in Local System"
            data.update({"fileChanged": isFileExist, "syncStatus": syncStatus})
        elif checksum_hs is None:
            isfileExists = "File doesn't exist in HydroShare Server"
            data.update({"fileChanged": isfileExists, "syncStatus": syncStatus})
        else:

            if checksum_local != checksum_hs:
                syncStatus = "Out of Sync"
                if modified_time_hs < modified_time_local:
                    # add fileChanged value
                    data.update(
                        {"fileChanged": localIsLatest, "syncStatus": syncStatus}
                    )
                elif modified_time_hs > modified_time_local:
                    data.update(
                        {"fileChanged": serverIsLatest, "syncStatus": syncStatus}
                    )

            else:
                syncStatus = "In Sync"
                data.update(
                    {
                        "fileChanged": "Local and HydroShare are synced",
                        "syncStatus": syncStatus,
                    }
                )


# NOTE: deprecated
class CheckSyncStatusFilesRequestHandler(HeadersMixIn, BaseRequestHandler):
    _custom_headers = [("Access-Control-Allow-Methods", "POST")]
    filesChanged = "sync"
    modified_time_local = ""
    modified_time_hs = ""

    def post(self, res_id):
        data = json.loads(self.request.body.decode("utf-8"))

        file_and_folder_paths = data.get("files")

        myList = []

        if file_and_folder_paths is None:
            self.set_status(400)  # Bad Request
            self.write('Could not find "files" in request body.')
            return
        for item_path in file_and_folder_paths:
            # file_path = item_path
            # Remove any leading /
            if item_path.startswith("/"):
                file_name = item_path[1:]

                local_data = ResourceLocalData(res_id)

                CheckSyncStatusFilesRequestHandler.modified_time_local = (
                    local_data.get_md5_files(file_name)
                )

                # appending local modified time to list
                hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
                CheckSyncStatusFilesRequestHandler.modified_time_hs = (
                    hs_data.get_md5_files(res_id, file_name)
                )

                if (
                    CheckSyncStatusFilesRequestHandler.modified_time_hs
                    < CheckSyncStatusFilesRequestHandler.modified_time_local
                ):

                    CheckSyncStatusFilesRequestHandler.filesChanged = "local"

                    myDict = {
                        "resourceId": res_id,
                        "filesChanged": CheckSyncStatusFilesRequestHandler.filesChanged,
                        "modified_time_local": CheckSyncStatusFilesRequestHandler.modified_time_local,
                        "file_name": file_name,
                        "file_path": item_path,
                    }
                    myList.append(myDict)
                    myJson = json.dumps(myList)

                elif (
                    CheckSyncStatusFilesRequestHandler.modified_time_hs
                    > CheckSyncStatusFilesRequestHandler.modified_time_local
                ):

                    myDict = {
                        "resourceId": res_id,
                        "filesChanged": CheckSyncStatusFilesRequestHandler.filesChanged,
                        "modified_time_local": CheckSyncStatusFilesRequestHandler.modified_time_hs,
                        "file_name": file_name,
                        "file_path": item_path,
                    }
                    myList.append(myDict)
                    myJson = json.dumps(myList)

        temporaryRoot = local_data.get_files_and_folders()

        self.write(
            {
                "readMe": local_data.get_readme(),
                "rootDir": temporaryRoot,
                "myJson": myJson,
            }
        )


# NOTE: deprecated
class DownloadedLocalFilesRequestHandler(HeadersMixIn, BaseRequestHandler):
    _custom_headers = [("Access-Control-Allow-Methods", "GET")]

    def get(self, res_id):
        local_data = ResourceLocalData(res_id)
        if not local_data.is_downloaded():
            self.write(
                {
                    "success": False,
                    "error": WORKSPACE_FILES_ERROR,
                    # 'error' : 'HydroShare files not present in Workspace',
                }
            )
            return
        else:
            local_file_data = local_data.get_files_and_folders()

            # checkFileSyncStatus(temporaryRoot, res_id)
            checkHydroShareSyncStatus(local_file_data, res_id, True)
            self.write(
                {
                    "readMe": local_data.get_readme(),
                    "rootDir": local_file_data,
                }
            )


# NOTE: deprecated
class MoveCopyFiles(HeadersMixIn, BaseRequestHandler):
    """Handles moving (or renaming) files within the local filesystem,
    on HydroShare, and between the two."""

    _custom_headers = [("Access-Control-Allow-Methods", "PATCH")]

    def patch(self, res_id):
        body = json.loads(self.request.body.decode("utf-8"))
        local_data = ResourceLocalData(res_id)
        hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
        file_operations = body["operations"]

        results = []
        success_count = 0
        failure_count = 0

        for operation in file_operations:
            method = operation["method"]  # 'copy' or 'move'
            src_uri = operation["source"]
            dest_uri = operation["destination"]

            # Split paths into filesystem prefix ('hs' or 'local') and path
            # relative to the resource root on
            # that filesystem
            src_fs, src_path = src_uri.split(":")
            dest_fs, dest_path = dest_uri.split(":")

            # If this operation involves HydroShare, make sure we're
            # authenticated
            if (
                src_path == HS_PREFIX or dest_fs == HS_PREFIX
            ) and not resource_manager.is_authenticated():
                results.append(
                    {
                        "success": False,
                        "error": HYDROSHARE_AUTHENTICATION_ERROR,
                    }
                )
                failure_count += 1
                continue

            # Remove the leading forward slashes
            src_path = src_path[1:]
            dest_path = dest_path[1:]

            # Exactly what operation we perform depends on where the source
            # and destination files/folders are
            # Move/copy within HydroShare
            if src_fs == HS_PREFIX and dest_fs == HS_PREFIX:
                if method == MOVE:  # Move or rename
                    try:
                        hs_data.rename_or_move_file(Path(src_path), Path(dest_path))
                        results.append({"success": True})
                        success_count += 1
                    except FileExistsError:
                        results.append(
                            {
                                "success": False,
                                "error": {
                                    "type": "FileOrFolderExists",
                                    "message": (
                                        f"The file {dest_path} already "
                                        "exists in HydroShare."
                                    ),
                                },
                            }
                        )
                        failure_count += 1
                else:  # TODO: Copy (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/42)
                    # The frontend never requests this, but if one were to
                    # add such functionality, you'd handle it here
                    raise NotImplementedError(
                        "Copy within HydroShare " "not implemented"
                    )
            # Move/copy within the local filesystem
            elif src_fs == LOCAL_PREFIX and dest_fs == LOCAL_PREFIX:
                if method == MOVE:  # Move or rename
                    ResourceLocalData(res_id).rename_or_move_item(src_path, dest_path)
                    results.append({"success": True})
                    success_count += 1
                else:  # TODO: Copy (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/42)
                    # The frontend never requests this, but if one were to
                    # add such functionality, you'd handle it here
                    raise NotImplementedError(
                        "Copy within the local " "filesystem not implemented yet"
                    )
            # Move/copy from the local filesystem to HydroShare
            elif src_fs == LOCAL_PREFIX and dest_fs == HS_PREFIX:
                # Transfer the file regardless of if we're moving or copying
                error = hs_data.upload_from_local(
                    local_data, Path(src_path), Path(dest_path)
                )
                if not error and method == MOVE:
                    # Delete the local copy of the file
                    error = ResourceLocalData(res_id).delete_file_or_folder(src_path)
                results.append(
                    {
                        "success": error is None,
                        "error": error,
                    }
                )
                if error:
                    failure_count += 1
                else:
                    success_count += 1
            # Move/copy from HydroShare to the local filesystem
            elif src_fs == HS_PREFIX and dest_fs == LOCAL_PREFIX:
                # Transfer the file regardless of if we're moving or copying
                hs_data.download_to_local(local_data, Path(src_path), Path(dest_path))
                if method == MOVE:
                    # Delete the HS copy of the file
                    hs_data.delete_file_or_folder(src_path)
                results.append({"success": True})
                success_count += 1
            else:
                msg = (
                    f'"source" prefix "{src_fs}" and/or destination '
                    f'prefix "{dest_fs} not recognized. Valid options'
                    f' are "hs" and "local"'
                )
                logging.warning(msg)
                results.append(
                    {
                        "success": False,
                        "error": "UnrecognizedPathPrefix",
                        "message": msg,
                    }
                )
                failure_count += 1

        self.write(
            {
                "results": results,
                "successCount": success_count,
                "failureCount": failure_count,
            }
        )


class UserInfoHandler(HeadersMixIn, BaseRequestHandler):
    """Get user information from HydroShare"""

    _custom_headers = [("Access-Control-Allow-Methods", "GET, OPTIONS")]

    def get(self):
        """Gets the user's information (name, email, etc) from HydroShare"""
        session = self.get_session()
        user = session.session.user(session.id).dict()
        self.write(user)


# NOTE: deprecated
def get_route_handlers(frontend_url, backend_url):
    # routes look like they need to be updated to remove .*
    return [
        # "frontend"
        (
            url_path_join(frontend_url, r"/assets/(.*)"),
            tornado.web.StaticFileHandler,
            {"path": str(assets_path)},
        ),
        # "backend"
        # (
        #     url_path_join(backend_url, r"/ws"),
        #     FileSystemEventWebSocketHandler,
        # ),
        (
            url_path_join(backend_url, r"/download/(.*)"),
            tornado.web.StaticFileHandler,
            {"path": str(data_path)},
        ),
        (url_path_join(backend_url, "/login"), LoginHandler),
        (url_path_join(backend_url, r"/user"), UserInfoHandler),
        (url_path_join(backend_url, r"/resources"), ListUserHydroShareResources),
        # (url_path_join(backend_url, r"/resources/([^/]+)"), ResourceHandler),
        (
            url_path_join(backend_url, r"/resources/([^/]+)"),
            ListHydroShareResourceFiles,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/download"),
            HydroShareResourceHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/upload"),
            LocalResourceEntityHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/download/(.+)"),
            HydroShareResourceEntityHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/hs-files"),
            ResourceHydroShareFilesRequestHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/download-hs-files"),
            DownloadHydroShareFilesRequestHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/check-sync-files"),
            CheckSyncStatusFilesRequestHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/local-files"),
            ResourceLocalFilesRequestHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/downloaded-local-files"),
            DownloadedLocalFilesRequestHandler,
        ),
        (url_path_join(backend_url, "/selectdir"), DirectorySelectorHandler),
        (url_path_join(backend_url, r"/resources/([^/]+)/localmd5"), Localmd5Handler),
        (url_path_join(backend_url, r"/resources/([^/]+)/hsmd5"), Hsmd5Handler),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/move-copy-files"),
            MoveCopyFiles,
        ),
        # Put this last to catch everything else
        # order does matter
        # Host patterns are processed sequentially in the order they were added. All matching patterns will be considered.
        (frontend_url + r".*", WebAppHandler),
    ]
