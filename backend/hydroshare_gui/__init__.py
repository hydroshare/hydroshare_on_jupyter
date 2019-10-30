def _jupyter_server_extension_paths():
    return [{
        "module": "hydroshare_gui"
    }]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("CUAHSI module enabled!")
