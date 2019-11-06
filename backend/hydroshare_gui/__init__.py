import socket
from .hs_server import start_server

HOST = '127.0.0.1'
PORT = 1025

def _jupyter_server_extension_paths():
    return [{
        "module": "hydroshare_gui"
    }]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("CUAHSI module enabled!")

    start_server()
