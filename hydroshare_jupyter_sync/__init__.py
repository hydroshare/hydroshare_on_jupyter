'''
This file sets up the jupyter server extension to launch our backend
server when jupyter is launched.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
'''
# !/usr/bin/python
# -*- coding: utf-8

import logging
from hydroshare_jupyter_sync.config_reader_writer import get_config_values
from hydroshare_jupyter_sync.index_html import (set_backend_url,
                                                set_frontend_url)
from .server import get_route_handlers
from notebook.utils import url_path_join


def _jupyter_server_extension_paths():
    """Creates the path to load the jupyter server extension.
    """
    return [{
        "module": "hydroshare_jupyter_sync"
    }]


def load_jupyter_server_extension(nb_server_app):
    """Sets up logging to a specific file, sets frontend & backend urls,
    and loads up the server extension.
    """
    nb_server_app.log.info("Successfully loaded hydroshare_jupyter_sync server"
                           "extension.")

    config = get_config_values(['logPath'])
    log_file_path = None
    if config:
        log_file_path = config.get('logPath')
    logging.basicConfig(level=logging.DEBUG, filename=log_file_path)

    web_app = nb_server_app.web_app

    frontend_base_url = url_path_join(web_app.settings['base_url'], 'sync')
    backend_base_url = url_path_join(web_app.settings['base_url'], 'syncApi')
    set_backend_url(backend_base_url)
    set_frontend_url(frontend_base_url)
    handlers = get_route_handlers(frontend_base_url, backend_base_url)
    web_app.add_handlers('.*$', handlers)
