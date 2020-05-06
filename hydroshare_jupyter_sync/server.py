"""
This file sets up the hydroshare server for communicating with the
hydroshare gui frontend.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
# !/usr/bin/python
# -*- coding: utf-8 -*-

import signal
import logging
import sys
import json
from hs_restclient import exceptions as HSExceptions
from hydroshare_jupyter_sync.resource_local_data import (ResourceLocalData,
                                                         LOCAL_PREFIX)
from hydroshare_jupyter_sync.resource_hydroshare_data import (
                                                    ResourceHydroShareData,
                                                    HS_PREFIX)
from hydroshare_jupyter_sync.resource_manager import (
                                                ResourceManager,
                                                HYDROSHARE_AUTHENTICATION_ERROR
                                                )
from hydroshare_jupyter_sync.index_html import get_index_html
from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join
from pathlib import Path

import tornado.ioloop
import tornado.web
import tornado.options

# Global resource handler variable
resource_manager = ResourceManager()

assets_path = Path(__file__).parent.parent / 'webapp' / 'public' / 'assets'
data_path = Path.cwd() / 'local_hs_resources'

# If we're running this file directly with Python, we'll be firing up a full
# Tornado web server, so use Tornado's RequestHandler as our base class.
# Otherwise (i.e. if this is being run by a Jupyter notebook server) we want to
# use IPythonHandler as our base class. (See the code at the bottom of this
# file for the server launching.)
BaseHandler = (tornado.web.RequestHandler if __name__ == '__main__'
               else IPythonHandler)


class BaseRequestHandler(BaseHandler):
    """ Sets the headers for all the request handlers that extend
        this class """
    def set_default_headers(self):
        # TODO: change from * (any server) to our specific url
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with, "
                        "content-type, x-xsrftoken")

    def options(self, _=None):
        # web browsers make an OPTIONS request to check what methods (line 31)
        # are allowed at/for an endpoint.
        self.set_status(204)  # No content
        self.finish()


class WebAppHandler(BaseRequestHandler):
    """ Serves up the HTML for the React web app """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS')

    def get(self):
        running_in_dev_mode = __name__ == '__main__'
        self.write(get_index_html(running_in_dev_mode))


class LoginHandler(BaseRequestHandler):
    """ Handles authenticating the user with HydroShare """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'OPTIONS, POST')

    def post(self):
        credentials = json.loads(self.request.body.decode('utf-8'))
        do_save = credentials.get('remember', False)
        user_info = resource_manager.authenticate(credentials['username'],
                                                  credentials['password'],
                                                  do_save)

        self.write({
            'success': user_info is not None,
            'userInfo': user_info,
        })


class ResourcesRootHandler(BaseRequestHandler):
    """ Handles /resources. Gets a user's resources (with metadata) and
        creates new resources. """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')

    def options(self, _=None):
        # web browsers make an OPTIONS request to check what methods (line 31)
        # are allowed at/for an endpoint.
        # We just need to respond with the header set on line 31.
        self.set_status(204)  # No content
        self.finish()

    def get(self):
        if not resource_manager.is_authenticated():
            self.write({
                'success': False,
                'error': HYDROSHARE_AUTHENTICATION_ERROR,
            })
            return

        resources, error = resource_manager.get_list_of_user_resources()
        archive_message = resource_manager.get_archive_message()

        self.write({'resources': resources,
                    'archive_message': archive_message,
                    'success': error is None,
                    'error': error})

    def post(self):
        """
        Makes a new resource with the bare minimum amount of information

        Expects body:
        {"resource title": string
        "creators": list of strings}
        """
        if not resource_manager.is_authenticated():
            self.write({
                'success': False,
                'error': HYDROSHARE_AUTHENTICATION_ERROR,
            })
            return

        body = json.loads(self.request.body.decode('utf-8'))
        resource_title = body.get("title")
        creators = body.get("creators")  # list of names (strings)
        abstract = body.get("abstract")
        privacy = body.get("privacy", 'Private')  # Public or private

        if resource_title is None or creators is None:
            self.set_status(400)
            self.write({
                'success': False,
                'error': {
                    'type': 'InvalidRequest',
                    'message': ('The request body must specify '
                                '"title" and "creators".'),
                },
            })
        else:
            resource_id, error = resource_manager.create_HS_resource(
                                resource_title, creators, abstract, privacy)
            self.write({
                'resource_id': resource_id,
                'success': error is None,
                'error': error,
            })


class ResourceHandler(BaseRequestHandler):
    """ Handles resource-specific requests made to /resources/<resource_id> """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'DELETE, OPTIONS')

    def delete(self, res_id):
        if not resource_manager.is_authenticated():
            self.write({
                'success': False,
                'error': HYDROSHARE_AUTHENTICATION_ERROR,
            })
            return

        body = json.loads(self.request.body.decode('utf-8'))
        del_locally_only = body.get("locallyOnly", True)
        error = resource_manager.delete_resource_locally(res_id)
        if not error and not del_locally_only:
            error = resource_manager.delete_resource_from_hs(res_id)

        self.write({
            'success': error is None,
            'error': error,
        })


class ResourceLocalFilesRequestHandler(BaseRequestHandler):
    """ Facilitates getting, deleting, and uploading to the files contained in
        a resource on the local disk """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', ('DELETE, GET,'
                                                         'OPTIONS, POST, PUT'))

    def get(self, res_id):
        local_data = ResourceLocalData(res_id)
        if not local_data.is_downloaded():
            resource_manager.save_resource_locally(res_id)
        self.write({
            'readMe': local_data.get_readme(),
            'rootDir': local_data.get_files_and_folders(),
        })

    # TODO (kyle) move some of the logic here outside this file and deduplicate
    # code
    def delete(self, res_id):
        body = json.loads(self.request.body.decode('utf-8'))
        file_and_folder_paths = body.get('files')
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
            if item_path.startswith('/'):
                item_path = item_path[1:]
            try:
                for deleted_folder in deleted_folders:
                    # Check if this file is in a folder that was deleted (a
                    # slash is appended to ensure that a file in,
                    # say, '/My data 2' is not skipped because '/My data' was
                    # deleted)
                    if item_path.startswith(deleted_folder + '/'):
                        # We can skip deleting this file because it was already
                        # deleted with its parent folder
                        break
                else:  # Only runs if the break statement above is never hit
                    # (yes, the indentation is right here)
                    # Try to delete this item
                    deleted_type = local_folder.delete_file_or_folder(
                        item_path)
                    if deleted_type == 'folder':
                        deleted_folders.append(item_path)
                success_count += 1
                results.append({'success': True})
            except Exception as e:
                logging.error(e)
                results.append({
                    'success': False,
                    'error': {
                        'type': 'UnknownError',
                        'message': (f'An unknown error occurred when '
                                    f'attempting to delete {item_path}.')
                    }
                })
                failure_count += 1

        self.write({
            'results': results,
            'successCount': success_count,
            'failureCount': failure_count,
        })

    def put(self, res_id):
        """ Creates a new file in the local copy of the resource

            :param res_id: the resource ID
            :type res_id: str
         """
        body = json.loads(self.request.body.decode('utf-8'))
        item_type = body.get('type')
        name = body.get('name')
        error_msg = None
        if item_type is None or name is None:
            error_msg = ('Request must include both "type" and "name" '
                         'attributes.')
        if not error_msg and not (item_type == 'file' or
                                  item_type == 'folder'):
            error_msg = '"type" attribute must be either "file" or "folder".'
        if error_msg:
            self.set_status(400)  # Bad Request
            self.write({
                'success': False,
                'error': {
                    'type': 'InvalidRequest',
                    'message': error_msg,
                },
            })
            return

        local_data = ResourceLocalData(res_id)
        if item_type == 'file':
            local_data.create_file(name)
        elif item_type == 'folder':
            local_data.create_local_folder(name)

        self.write({
            'success': True,
        })

    def post(self, res_id):
        """ Uploads a file from the user's computer to the local filesystem

            :param res_id: the resource ID
            :type res_id: str
         """
        local_data = ResourceLocalData(res_id)
        for field_name, files in self.request.files.items():
            for info in files:
                with open(str(local_data.data_path /
                          info['filename']), "wb") as f:
                    f.write(info['body'])
        self.write({
            'success': True,
        })


class ResourceHydroShareFilesRequestHandler(BaseRequestHandler):
    """ Handles getting and deleting the files in a HydroShare resource """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS')

    def get(self, res_id):
        if not resource_manager.is_authenticated():
            self.write({
                'success': False,
                'error': HYDROSHARE_AUTHENTICATION_ERROR,
            })
            return

        # TODO: Get folder info
        hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
        root_dir = hs_data.get_files()
        self.write({'rootDir': root_dir})

    # TODO (kyle): Move the bulk of this function out of this file and
    # deduplicate code
    def delete(self, res_id):
        if not resource_manager.is_authenticated():
            self.write({
                'success': False,
                'error': HYDROSHARE_AUTHENTICATION_ERROR,
            })
            return

        data = json.loads(self.request.body.decode('utf-8'))
        file_and_folder_paths = data.get('files')
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
            if item_path.startswith('/'):
                item_path = item_path[1:]
            try:
                for deleted_folder in deleted_folders:
                    # Check if this file is in a folder that was deleted (a
                    # slash is appended to ensure that a file in,
                    # say, '/My data 2' is not skipped because '/My data'
                    # was deleted)
                    if item_path.startswith(deleted_folder + '/'):
                        # We can skip deleting this file because it was already
                        # deleted with its parent folder
                        break
                else:  # Only runs if the break statement above is never hit
                    # (yes, the indentation is right here)
                    # Try to delete this item
                    deleted_type = hs_data.delete_file_or_folder(item_path)
                    if deleted_type == 'folder':
                        deleted_folders.append(item_path)
                success_count += 1
                results.append({'success': True})
            except HSExceptions.HydroShareNotFound:
                results.append({
                    'success': False,
                    'error': {
                        'type': 'NotFoundError',
                        'message': f'Could not find {item_path} in '
                                   'HydroShare.',
                    },
                })
            except HSExceptions.HydroShareNotAuthorized:
                results.append({
                    'success': False,
                    'error': {
                        'type': 'NotAuthorizedError',
                        'message': (f'Could not delete {item_path}. Do you '
                                    'have write access to the resource?'),
                    },
                })
            except Exception as e:
                logging.error(e)
                results.append({
                    'success': False,
                    'error': {
                        'type': 'UnknownError',
                        'message': (f'An unknown error occurred when'
                                    ' attempting to delete {item_path}.')
                    }
                })
                failure_count += 1

        self.write({
            'results': results,
            'successCount': success_count,
            'failureCount': failure_count,
        })


MOVE = 'move'
COPY = 'copy'


class MoveCopyFiles(BaseRequestHandler):
    """ Handles moving (or renaming) files within the local filesystem,
        on HydroShare, and between the two. """

    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'PATCH, OPTIONS')

    def patch(self, res_id):
        body = json.loads(self.request.body.decode('utf-8'))
        local_data = ResourceLocalData(res_id)
        hs_data = ResourceHydroShareData(resource_manager.hs_api_conn, res_id)
        file_operations = body['operations']

        results = []
        success_count = 0
        failure_count = 0

        for operation in file_operations:
            method = operation['method']  # 'copy' or 'move'
            src_uri = operation['source']
            dest_uri = operation['destination']

            # Split paths into filesystem prefix ('hs' or 'local') and path
            # relative to the resource root on
            # that filesystem
            src_fs, src_path = src_uri.split(':')
            dest_fs, dest_path = dest_uri.split(':')

            # If this operation involves HydroShare, make sure we're
            # authenticated
            if ((src_path == HS_PREFIX or dest_fs == HS_PREFIX) and
                    not resource_manager.is_authenticated()):
                results.append({
                    'success': False,
                    'error': HYDROSHARE_AUTHENTICATION_ERROR,
                })
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
                        hs_data.rename_or_move_file(Path(src_path),
                                                    Path(dest_path))
                        results.append({'success': True})
                        success_count += 1
                    except FileExistsError:
                        results.append({
                            'success': False,
                            'error': {
                                'type': 'FileOrFolderExists',
                                'message': (f'The file {dest_path} already '
                                            'exists in HydroShare.'),
                            },
                        })
                        failure_count += 1
                else:  # TODO: Copy
                    # The frontend never requests this, but if one were to
                    # add such functionality, you'd handle it here
                    raise NotImplementedError('Copy within HydroShare '
                                              'not implemented')
            # Move/copy within the local filesystem
            elif src_fs == LOCAL_PREFIX and dest_fs == LOCAL_PREFIX:
                if method == MOVE:  # Move or rename
                    ResourceLocalData(res_id).rename_or_move_item(src_path,
                                                                  dest_path)
                    results.append({'success': True})
                    success_count += 1
                else:  # Copy
                    # The frontend never requests this, but if one were to
                    # add such functionality, you'd handle it here
                    raise NotImplementedError('Copy within the local '
                                              'filesystem not implemented yet')
            # Move/copy from the local filesystem to HydroShare
            elif src_fs == LOCAL_PREFIX and dest_fs == HS_PREFIX:
                # Transfer the file regardless of if we're moving or copying
                error = hs_data.upload_from_local(local_data, Path(src_path),
                                                  Path(dest_path))
                if not error and method == MOVE:
                    # Delete the local copy of the file
                    error = (ResourceLocalData(res_id).
                             delete_file_or_folder(src_path))
                results.append({
                    'success': error is None,
                    'error': error,
                })
                if error:
                    failure_count += 1
                else:
                    success_count += 1
            # Move/copy from HydroShare to the local filesystem
            elif src_fs == HS_PREFIX and dest_fs == LOCAL_PREFIX:
                # Transfer the file regardless of if we're moving or copying
                hs_data.download_to_local(local_data, Path(src_path),
                                          Path(dest_path))
                if method == MOVE:
                    # Delete the HS copy of the file
                    hs_data.delete_file_or_folder(src_path)
                results.append({'success': True})
                success_count += 1
            else:
                msg = f'"source" prefix "{src_fs}" and/or destination ' \
                      f'prefix "{dest_fs} not recognized. Valid options' \
                      f' are "hs" and "local"'
                logging.warning(msg)
                results.append({
                    'success': False,
                    'error': 'UnrecognizedPathPrefix',
                    'message': msg,
                })
                failure_count += 1

        self.write({
            'results': results,
            'successCount': success_count,
            'failureCount': failure_count,
        })


class UserInfoHandler(BaseRequestHandler):
    """ Handles getting the user's information (name, email, etc)
        from HydroShare and storing the user's
        HydroShare credentials.
     """
    def set_default_headers(self):
        BaseRequestHandler.set_default_headers(self)
        self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS')

    def get(self):
        """ Gets the user's information (name, email, etc) from HydroShare """
        if not resource_manager.is_authenticated():
            data, error = None, HYDROSHARE_AUTHENTICATION_ERROR
        else:
            data, error = resource_manager.get_user_info()
        self.write({'data': data,
                    'success': error is None,
                    'error': error})


class TestApp(tornado.web.Application):
    """ Class for setting up the server & making sure it can exit cleanly """

    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info('exiting...')
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
            tornado.ioloop.IOLoop.instance().stop()
            logging.info('exit success')


def get_route_handlers(frontend_url, backend_url):
    return [
        (url_path_join(frontend_url, r"/assets/(.*)"),
            tornado.web.StaticFileHandler, {'path': str(assets_path)}),
        (url_path_join(backend_url, r"/download/(.*)"),
            tornado.web.StaticFileHandler, {'path': str(data_path)}),
        (url_path_join(backend_url, "/login"), LoginHandler),
        (url_path_join(backend_url, r"/user"), UserInfoHandler),
        (url_path_join(backend_url, r"/resources"), ResourcesRootHandler),
        (url_path_join(backend_url, r"/resources/([^/]+)"), ResourceHandler),
        (url_path_join(backend_url, r"/resources/([^/]+)/hs-files"),
            ResourceHydroShareFilesRequestHandler),
        (url_path_join(backend_url, r"/resources/([^/]+)/local-files"),
            ResourceLocalFilesRequestHandler),
        (url_path_join(backend_url, r"/resources/([^/]+)/move-copy-files"),
            MoveCopyFiles),
        # Put this last to catch everything else
        (frontend_url + r".*", WebAppHandler),
    ]


if __name__ == '__main__':
    LEVELS = {'debug': logging.DEBUG,
              'info': logging.INFO,
              'warning': logging.WARNING,
              'error': logging.ERROR,
              'critical': logging.CRITICAL}

    if len(sys.argv) > 1:
        level_name = sys.argv[1]
        level = LEVELS.get(level_name, logging.NOTSET)
        logging.basicConfig(level=level)

    app = TestApp(get_route_handlers('/', '/syncApi'))
    print("Starting server at localhost:8080")
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, app.signal_handler)
    app.listen(8080)
    tornado.ioloop.PeriodicCallback(app.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
