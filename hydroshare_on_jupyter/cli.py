import argparse
from pathlib import Path
from typing import Union
from .utilities.pathlib_utils import expand_and_resolve


class CommandNamespace:
    start: str = "start"
    configure: str = "configure"


def parse() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="hydroshare_on_jupyter",
        description=(
            """HydroShare on Jupyter:\n\t
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

    commands = parser.add_subparsers(title="commands", dest="command")
    start = commands.add_parser(
        CommandNamespace.start,
        help="start a stand-alone instance of the backend server extension.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,  # This adds defaults to help page
    )
    commands.add_parser(
        CommandNamespace.configure,
        help="link hydroshare_on_jupyter's lab and server extension with jupyter.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,  # This adds defaults to help page
    )

    start.add_argument(
        "-p",
        "--port",
        type=int,
        nargs="?",
        help="port number to listen on",
        default=8080,
    )

    start.add_argument(
        "-n",
        "--hostname",
        type=str,
        nargs="?",
        help="HTTP server hostname",
        default="127.0.0.1",  # localhost
    )

    # default to run in debug mode
    start.add_argument(
        "-d",
        "--no-debug",
        action="store_true",
        default=False,
        help="disable debugging mode",
        dest="debug",
    )

    start.add_argument(
        "-c",
        "--config",
        nargs="?",
        type=absolute_file_path,
        help="path to configuration file. by default read from ~/.config/hydroshare_on_jupyter/config then ~/.hydroshare_on_jupyter_config if either exist.",
        required=False,
    )

    return parser


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
