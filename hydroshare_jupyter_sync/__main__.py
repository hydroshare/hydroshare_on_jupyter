import logging
import sys
import signal
import tornado

from .server import get_route_handlers


class TestApp(tornado.web.Application):
    """Class for setting up the server & making sure it can exit cleanly"""

    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info("exiting...")
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
            tornado.ioloop.IOLoop.instance().stop()
            logging.info("exit success")


def get_test_app() -> tornado.web.Application:
    """Thin wrapper returning web.Application instance. Written in this way for use in
    unit tests.
    """
    return TestApp(
        get_route_handlers("/", "/syncApi"),
        cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
        login_url="/syncApi/login",
    )


if __name__ == "__main__":
    # TODO: add cli
    LEVELS = {
        "debug": logging.DEBUG,
        "info": logging.INFO,
        "warning": logging.WARNING,
        "error": logging.ERROR,
        "critical": logging.CRITICAL,
    }

    if len(sys.argv) > 1:
        level_name = sys.argv[1]
        level = LEVELS.get(level_name, logging.NOTSET)
        logging.basicConfig(level=level)

    app = get_test_app()
    print("Starting server at localhost:8080")
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, app.signal_handler)
    app.listen(8080)
    tornado.ioloop.PeriodicCallback(app.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
