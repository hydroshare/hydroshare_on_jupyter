import argparse
import logging
import signal
import sys

from tornado import options
from tornado import ioloop
from tornado.web import Application
from pathlib import Path
from .handlers import get_route_handlers
from .cli import parse
from .config_setup import ConfigFile


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
        template_path=Path(__file__).resolve().parent / "templates",
        **settings,
    )


def main(parser: argparse.Namespace):
    # clear argv. options parse command line somehow sets up logging
    # tornados logging setup is pretty broken. Do not want to pass any command line args
    # here
    sys.argv = []
    options.parse_command_line()
    debug_enabled = not parser.no_debug
    # TODO: write logs to file in config.log

    # parse config file
    config = (
        ConfigFile() if parser.config is None else ConfigFile(_env_file=parser.config)
    )

    app = get_test_app(
        default_hostname=parser.hostname, debug=debug_enabled, **config.dict()
    )

    logging.info(f"Server starting on {parser.hostname}:{parser.port}")
    logging.info(f"Debugging mode {'enabled' if debug_enabled else 'disabled'}")

    signal.signal(signal.SIGINT, app.signal_handler)
    app.listen(parser.port)
    ioloop.PeriodicCallback(app.try_exit, 100).start()
    ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    parser = parse()
    main(parser)
