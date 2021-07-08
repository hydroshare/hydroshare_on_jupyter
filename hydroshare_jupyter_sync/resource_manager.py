"""
This file sets up the resource handler for working with resources in
HydroShare & JupyterHub.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# -*- coding: utf-8 -*-
import base64
import json
import logging
import shutil
import zipfile
from pathlib import Path
from typing import Union

from hs_restclient import HydroShare, HydroShareAuthBasic
from hs_restclient.exceptions import HydroShareHTTPException

from hsclient import HydroShare

# local imports
from .config_reader_writer import get_config_values
from .credential_reader_writer import (
    get_credential_values,
    set_credential_values,
)
from .utilities.pathlib_utils import expand_and_resolve

# module logger instance
_log = logging.getLogger(__name__)

HYDROSHARE_AUTHENTICATION_ERROR = {
    "type": "HydroShareAuthenticationError",
    "message": "Invalid HydroShare username or password.",
}
PERMISSION_ERROR = {
    "type": "PermissionDeniedError",
    "message": "Cannot write to Directory, check you have write permissions",
}

# TODO: should be moved else where
defaultPath = Path.home() / "hydroshare" / "local_hs_resources"
data_log = Path.home() / "hydroshare" / "sync.log"


class ResourceManager:
    """Class that defines a handler for working with all of a user's resources.
    This is where they will be able to delete a resource, create a new one, or
    just get the list of a user's resources in hydroshare or jupyterhub.
    """

    def __init__(
        self,
        *,
        data_path: Union[str, Path] = Path("~/hydroshare"),
    ) -> None:
        """Makes an output folder for storing HS files locally, if none exists,
        and sets up authentication on hydroshare API.
        """
        self._data_path = expand_and_resolve(data_path)

        # Create directories if they don't already exist
        self._data_path.mkdir(parents=True, exist_ok=True)

        self._session = None  # Use 'authenticate' to initialize

        self._archive_message = None

    def authenticate(
        self,
        username: str = None,
        password: str = None,
        host: str = HydroShare.default_host,
        protocol: str = HydroShare.default_protocol,
        port: int = HydroShare.default_port,
        client_id: str = None,
        token: str = None,
    ) -> dict:
        """Create and authenticate request session with HydroShare.

        Parameters
        ----------
        username : str, optional
            HydroShare username, by default None
        password : str, optional
            HydroShare password, by default None
        host : str, optional
            hostname of hydroshare instance, by default "www.hydroshare.org"
        protocol : str, optional
            request protocol, by default "https"
        port : int, optional
            request port, by default 443
        client_id : str, optional
            client id associated with OAuth2 token, by default None
        token : str, optional
            OAuth2 token, by default None

        Returns
        -------
        dict
            Dictionary of user info
        """
        # TODO: verify that username and password's of None can't be passed to create a non-login session
        # instantiate authenticated session
        self._session = HydroShare(
            username=username,
            password=password,
            host=host,
            protocol=protocol,
            port=port,
            client_id=client_id,
            token=token,
        )

        # Retrieve user info
        return self._session.my_user_info()

    def is_authenticated(self) -> bool:
        """Return the status of the HydroShare authenticated requests session.

        Returns
        -------
        bool
        """
        return self._session is not None

    def save_resource_locally(self, res_id: str):
        # Get resource from HS if it doesn't already exist locally
        res_path = self._data_path / res_id
        if not (res_path).exists():
            _log.info(f"Downloading resource {res_id} from HydroShare.")

            res = self._session.resource(res_id)
            res.download(save_path=self._data_path)

            res_zip = res_path.with_suffix(".zip")
            _log.debug(f"Unzipping resource {res_zip}.")

            with zipfile.ZipFile(res_zip, "r") as zip_ref:
                zip_ref.extractall(res_path)

            _log.debug(f"Removing zipped bag resource {res_zip}.")
            # delete zip bag archive
            res_zip.unlink()

    def save_file_locally(self, res_id, item_path):
        """ Downloads a file from HydroShare to the local filesystem if a copy does
            not already exist locally

            :param res_id: the resource ID
            :type res_id: str
        """
        # Get resource from HS if it doesn't already exist locally
        config = get_config_values(['dataPath', 'hydroShareHostname'])
        self.output_folder = Path(config['dataPath'])
        logging.info(f"Downloading file {res_id} from HydroShare...")
        folderlocation = Path(config['dataPath'] + '/' + res_id + '/' +
                              res_id + '/data/contents')
        if not (self.output_folder / res_id).exists():
            folderlocation.mkdir(parents=True)

        self.hs_api_conn.getResourceFile(res_id,
                                         item_path,
                                         destination=folderlocation)

    def get_user_info(self):
        """Gets information about the user currently logged into HydroShare
        """
        user_info = None
        error = None
        try:
            user_info = self.hs_api_conn.getUserInfo()
        except HydroShareHTTPException as e:
            if e.status_code == 401:  # Unauthorized
                error = HYDROSHARE_AUTHENTICATION_ERROR
            else:
                error = {
                    'type': 'GenericHydroShareHTTPException',
                    'message': e.status_msg,
                }

        return user_info, error

    def delete_resource_locally(self, res_id):
        """ Attempts to delete the local copy of the resource files from the
            disk

            :param res_id: the ID of the resource to delete
            :type res_id: str
         """
        resource_path = self.output_folder / res_id
        if not resource_path.exists():
            return {
                'type':
                'FileNotFoundError',
                'message': (f'Could not find a local copy of resource {res_id}'
                            ' to delete.'),
            }
        try:
            shutil.rmtree(str(resource_path))
        except IOError:
            return {
                'type':
                'IOError',
                'message': (f'Something went wrong. Could not delete'
                            f' resourc {res_id}.'),
            }
        return None  # No error

    def delete_resource_from_hs(self, res_id):
        try:
            self.hs_api_conn.deleteResource(res_id)
        except HydroShareHTTPException as e:
            return {
                'type': 'GenericHydroShareHTTPException',
                'message': e.status_msg,
            }
        return None  # No error

    def get_local_resource_ids(self):
        """ Gets a list of IDs of all the resources saved locally

            :return a set of strings containing all of the resource IDs
            :rtype set<str>
         """
        return set(map(lambda p: p.name, self.output_folder.glob('*')))

    def get_list_of_user_resources(self):
        # TODO: speed this up (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/39)
        """Gets list of all the resources for the logged in user, including
        those stored on hydroshare and those stored locally on jupyterhub
        and information about each one including whether HS ones are stored
        locally.

        Assumes there are no local resources that don't exist in HS
        """
        error = None

        resources = {}

        # Get local res_ids
        self.local_res_ids = self.get_local_resource_ids()

        # Get the user's resources from HydroShare
        user_hs_resources = self.hs_api_conn.resources(owner=self.username)

        try:
            # Resources can't be listed if auth fails
            hs_resources = list(user_hs_resources)
        except AttributeError:
            return None, HYDROSHARE_AUTHENTICATION_ERROR

        for res in hs_resources:
            res_id = res['resource_id']

            resources[res_id] = {
                'abstract': res.get('abstract'),
                'authors': res.get('authors'),
                'creator': res.get('creator'),
                'created': res.get('date_created'),
                'lastUpdated': res.get('date_last_updated'),
                'localCopyExists': res_id in self.local_res_ids,
                'localFiles': res.get('localFiles'),
                'id': res_id,
                'isPublic': res.get('public'),
                'published': res.get('published'),
                'status': res.get('status'),
                'title': res.get('resource_title'),
                'url': res.get('resource_url'),
            }

        return list(resources.values()), error

    def create_HS_resource(self,
                           resource_title,
                           creators,
                           abstract="",
                           privacy="Private"):
        """
        Creates a hydroshare resource from the metadata specified in a dict
        using the given resource_title and specified creators

        """
        error = None
        resource_id = None

        # Type errors for resource_title and creators
        if not isinstance(resource_title, str):
            error = {
                'type': 'IncorrectType',
                'message': 'Resource title should be a string.'
            }
            return resource_id, error
        if (not isinstance(creators, list)
                or not all(isinstance(creator, str) for creator in creators)):
            error = {
                'type': 'IncorrectType',
                'message': '"Creators" object should be a '
                'list of strings.'
            }
            return resource_id, error

        if abstract is None:
            abstract = ""

        if privacy == "Public":
            public = True
        else:
            public = False

        meta_metadata = []

        for creator in creators:
            meta_metadata.append({"creator": {"name": creator}})
        meta_metadata = json.dumps(meta_metadata)

        metadata = {
            'abstract': abstract,
            'title': resource_title,
            'keywords': (),
            'rtype': 'GenericResource',
            'fpath': '',
            'metadata': meta_metadata,
            'extra_metadata': ''
        }

        resource_id = ''
        try:
            resource_id = (self.hs_api_conn.createResource(
                metadata['rtype'],
                metadata['title'],
                resource_file=metadata['fpath'],
                keywords=metadata['keywords'],
                abstract=metadata['abstract'],
                metadata=metadata['metadata'],
                extra_metadata=metadata['extra_metadata']))

            self.hs_api_conn.setAccessRules(resource_id, public=public)
        except Exception:
            error = {
                'type': 'UnknownError',
                'message': 'Unable to create resource.'
            }
        return resource_id, error

    def create_copy_of_resource_in_hs(self, src_res_id):
        """ Makes a copy of a resource in HydroShare and updates the local copy
            of the old resource to point to the new copy.

            :param src_res_id: the ID of the resource in HydroShare to
            duplicate
            :type src_res_id: str
            :returns the new resource ID
        """
        response = self.hs_api_conn.resource(src_res_id).copy()
        new_id = response.content.decode("utf-8")  # b'id'

        is_local = src_res_id in self.local_res_ids

        # if a local version exists under the old resource ID, rename it to
        # point to the new one
        if is_local:
            og_path = self.output_folder / src_res_id / src_res_id
            new_path = self.output_folder / new_id / new_id
            shutil.move(str(og_path), str(new_path))

        # Change name to 'Copy of []'
        title = self.hs_api_conn.getScienceMetadata(new_id)['title']
        new_title = "Copy of " + title
        self.hs_api_conn.updateScienceMetadata(new_id, {"title": new_title})

        return new_id

    def get_archive_message(self):
        """ Gets the message to display on the resource page prompting the user
            to archive their resources to HydroShare
         """
        if not self._archive_message:
            config = get_config_values(['archiveMessage'])
            if config:
                self._archive_message = config.get('archiveMessage')
        return self._archive_message
