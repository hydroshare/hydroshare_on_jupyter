"""
Setup jupyterlab server and lab extensions. Add tornado HTTP handlers to jupyter session.
"""
import json
from pathlib import Path

# local imports
from .handlers import get_route_handlers

# Constants
FRONTEND_PATH = "/sync"
BACKEND_PATH = "/syncApi"

MODULE_NAME = "hydroshare_jupyter_sync"
EXTENSION_DIRNAME = "labextension"

PARENT_DIR = Path(__file__).parent.resolve()
EXTENSION_METADATA_PATH = PARENT_DIR / f"{EXTENSION_DIRNAME}/package.json"

# read metadata from js extension package metadata file, `package.json`
extension_metadata = json.loads(EXTENSION_METADATA_PATH.read_text())


def _jupyter_labextension_paths():
    return [{"src": EXTENSION_DIRNAME, "dest": extension_metadata["name"]}]


def _jupyter_server_extension_points():
    return [{"module": MODULE_NAME}]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    handlers = get_route_handlers(FRONTEND_PATH, BACKEND_PATH)

    server_app.web_app.add_handlers(".*$", handlers)
    server_app.log.info(f"Registered {MODULE_NAME} extension")


# For backward compatibility with the classical notebook
load_jupyter_server_extension = _load_jupyter_server_extension
