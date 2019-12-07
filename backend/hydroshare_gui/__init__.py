import socket
from .hs_server import start_server, make_app


def _jupyter_server_extension_paths():
    return [{
        "module": "hydroshare_gui"
    }]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("CUAHSI module enabled!")

    app = make_app()
    start_server(app)
