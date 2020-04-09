'''
This file sets up the jupyter server extension to launch our backend
server when jupyter is launched.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8

import socket
from .server import start_server, make_app


def _jupyter_server_extension_paths():
    return [{
        "module": "hydroshare_jupyter_sync"
    }]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("Successfully loaded hydroshare_jupyter_sync server extension.")

    app = make_app()
    start_server(app)
