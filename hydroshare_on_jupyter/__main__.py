import argparse
import logging
import os
import signal
import sys
from pathlib import Path

from jupyter_core.paths import ENV_JUPYTER_PATH
from jupyter_server.extension.serverextension import EnableServerExtensionApp

from tornado import options
from tornado import ioloop
from tornado.web import Application
from pathlib import Path
from .handlers import get_route_handlers
from .cli import CommandNamespace, parse
from .config_setup import ConfigFile

MODULE_DIR = Path(__file__).parent.resolve()
_ERROR_MESSAGE_PREFIX = "Fatal, cannot link labextension."

# path to pre-built lab-extension
EXTENSION_NAME = "hydroshare_on_jupyter"
LABEXTENSION_PATH = MODULE_DIR / "labextension"


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


def enable_server_extension(extension_name: str):
    o = EnableServerExtensionApp()
    o.toggle_server_extension(extension_name)


def get_env_jupyter_path() -> Path:
    """Absolute path to Jupyter's ENV_JUPYTER_PATH.
    If multiple ENV_JUPYTER_PATH's are specified, the first is returned.
    """
    try:
        return Path(ENV_JUPYTER_PATH[0]).resolve()
    except IndexError as e:
        error_message = f"{_ERROR_MESSAGE_PREFIX} ENV_CONFIG_PATH not set."
        raise ValueError(error_message) from e


def link_prebuilt_labextension(
    labextension_name: str, labextension_prebuilt_files_dir: str
):
    labextension_prebuilt_files_dir = Path(labextension_prebuilt_files_dir).resolve()

    # naively verify that labextension exists (does not verify contents of directory. i.e. package.json exists)
    if (
        not labextension_prebuilt_files_dir.exists()
        or not labextension_prebuilt_files_dir.is_dir()
    ):
        error_message = f"{_ERROR_MESSAGE_PREFIX} labextension_prebuilt_files_dir: {labextension_prebuilt_files_dir} does not exist."
        raise FileNotFoundError(error_message)

    labextensions_path = get_env_jupyter_path() / "labextensions"

    # create `labextensions` directory if it does not already exist. Create intermediate dirs if necessary
    labextensions_path.mkdir(exist_ok=True, parents=True)

    link_dir = labextensions_path / labextension_name

    # choose not to fail raise exception if link_dir exists.
    if link_dir.exists():
        if link_dir.is_symlink() and os.readlink(str(link_dir)) == str(
            labextension_prebuilt_files_dir
        ):
            print(f"{labextension_prebuilt_files_dir} already linked to {link_dir}")
        else:
            print(
                f"Could not link {labextension_prebuilt_files_dir} to {link_dir}. {link_dir} already exists. Remove {link_dir} and reinstall."
            )
    else:
        # note: target_is_directory True, required for windows support
        link_dir.symlink_to(labextension_prebuilt_files_dir, target_is_directory=True)

        print(f"{labextension_prebuilt_files_dir} linked to {link_dir}")


def configure_jupyter() -> None:
    # link lab extension to correct location and enable server extension
    link_prebuilt_labextension(EXTENSION_NAME, LABEXTENSION_PATH)
    enable_server_extension(EXTENSION_NAME)


def start_stand_alone_session(
    hostname: str, port: int, debug: bool, config: ConfigFile
) -> None:
    app = get_test_app(default_hostname=hostname, debug=debug, **config.dict())

    logging.info(f"Server starting on {hostname}:{port}")
    logging.info(f"Debugging mode {'enabled' if debug else 'disabled'}")

    signal.signal(signal.SIGINT, app.signal_handler)
    app.listen(port)
    ioloop.PeriodicCallback(app.try_exit, 100).start()
    ioloop.IOLoop.instance().start()


def main(parser: argparse.Namespace) -> None:
    # clear argv. options parse command line somehow sets up logging
    # tornados logging setup is pretty broken. Do not want to pass any command line args
    # here
    sys.argv = []
    options.parse_command_line()

    # command routing
    if parser.command == CommandNamespace.configure:
        configure_jupyter()

    elif parser.command == CommandNamespace.start:
        # TODO: write logs to file in config.log
        # parse config file
        config = (
            ConfigFile()
            if parser.config is None
            else ConfigFile(_env_file=parser.config)
        )

        kwargs = {
            "hostname": parser.hostname,
            "port": parser.port,
            "debug": not parser.debug,
            "config": config,
        }

        start_stand_alone_session(**kwargs)


if __name__ == "__main__":
    parser = parse()
    if len(sys.argv) <= 1:
        parser.print_help()
    main(parser.parse_args())
