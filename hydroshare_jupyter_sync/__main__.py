import argparse
import logging
import signal
import sys

from tornado import options
from tornado import ioloop
from tornado.web import Application
from pathlib import Path
from typing import Union

from .server import get_route_handlers


class TestApp(Application):
    """Class for setting up the server & making sure it can exit cleanly"""

    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info("Shutting down")
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
            ioloop.IOLoop.instance().stop()
            logging.info("Exit successful")


def get_test_app(**settings) -> Application:
    """Thin wrapper returning web.Application instance. Written in this way for use in
    unit tests.
    """
    return TestApp(
        get_route_handlers("/", "/syncApi"),
        cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
        login_url="/syncApi/login",
        **settings,
    )


def is_file_and_exists(f: Union[str, Path]) -> bool:
    f = Path(f).resolve()
    return f.is_file() and f.exists()


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
        type=argparse.FileType("r"),
        help="Path to configuration file. By default read from ~/.config/hydroshare_jupyter_sync/config then ~/.hydroshare_jupyter_sync_config if either exist.",
        required=False,
    )

    return parser.parse_args()


def main():
    parser = parse()

    # clear argv. options parse command line somehow sets up logging
    # tornados logging setup is pretty broken. Do not want to pass any command line args
    # here
    sys.argv = []
    options.parse_command_line()
    debug_enabled = not parser.no_debug

    app = get_test_app(
        default_hostname=parser.hostname,
        debug=debug_enabled,
    )

    logging.info(f"Server starting on {parser.hostname}:{parser.port}")
    logging.info(f"Debugging mode {'enabled' if debug_enabled else 'disabled'}")

    signal.signal(signal.SIGINT, app.signal_handler)
    app.listen(parser.port)
    ioloop.PeriodicCallback(app.try_exit, 100).start()
    ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
