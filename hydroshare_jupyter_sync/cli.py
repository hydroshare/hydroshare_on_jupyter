import argparse
from pathlib import Path
from typing import Union
from .utilities.pathlib_utils import expand_and_resolve


def parse() -> Union[argparse.Namespace, None]:
    parser = argparse.ArgumentParser(
        prog="hydroshare_jupyter_sync",
        description=(
            """HydroShare Jupyter Sync:\n\t
            A Jupyter server extension enabling management of HydroShare resource
            files within Jupyter. Open HydroShare resources, work on their files,
            and then sync those changes back to HydroShare using a drag-and-drop
            interface.

            Note:
                Debug mode is enabled by default when starting the server via this CLI.
            """
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,  # This adds defaults to help page
    )

    parser.add_argument(
        "-p",
        "--port",
        type=int,
        nargs="?",
        help="Port number to listen on",
        default=8080,
    )

    parser.add_argument(
        "-n",
        "--hostname",
        type=str,
        nargs="?",
        help="HTTP Server hostname",
        default="127.0.0.1",  # localhost
    )

    parser.add_argument(
        "-d",
        "--no-debug",
        action="store_true",
        default=False,
        help="Disable debugging mode",
    )

    parser.add_argument(
        "-c",
        "--config",
        nargs="?",
        type=absolute_file_path,
        help="Path to configuration file. By default read from ~/.config/hydroshare_jupyter_sync/config then ~/.hydroshare_jupyter_sync_config if either exist.",
        required=False,
    )

    return parser.parse_args()


def is_file_and_exists(f: Union[str, Path]) -> bool:
    """Expand and resolve path and return if it is a file."""
    f = expand_and_resolve(f)
    return f.is_file() and f.exists()


def absolute_file_path(f: Union[str, Path]) -> str:
    """Return absolute path to file, if exists."""
    f = expand_and_resolve(f)
    if is_file_and_exists(f):
        return str(f)
    raise FileNotFoundError(f"File: {f}, does not exist.")
