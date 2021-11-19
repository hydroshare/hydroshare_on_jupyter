from pathlib import Path
from notebook.utils import url_path_join
import tornado
from ..websocket_handler import FileSystemEventWebSocketHandler
from ..server import (
    DataDirectoryHandler,
    LoginHandler,
    UserInfoHandler,
    ListUserHydroShareResources,
    ListHydroShareResourceFiles,
    HydroShareResourceHandler,
    LocalResourceEntityHandler,
    HydroShareResourceEntityHandler,
    WebAppHandler,
    UsingOAuth,
)


def get_route_handlers(frontend_url, backend_url):
    # TODO: These are constants, so change case
    # also, this should be moved to the config setup
    mod_path = Path(__file__).absolute().parent.parent
    assets_path = mod_path / "assets"
    data_path = Path("~").expanduser() / "hydroshare" / "local_hs_resources"

    # routes look like they need to be updated to remove .*
    return [
        # "frontend"
        (
            url_path_join(frontend_url, r"/assets/(.*)"),
            tornado.web.StaticFileHandler,
            {"path": str(assets_path)},
        ),
        # "backend"
        (
            url_path_join(backend_url, r"/oauth"),
            UsingOAuth,
        ),
        (
            url_path_join(backend_url, r"/ws"),
            FileSystemEventWebSocketHandler,
        ),
        (
            url_path_join(backend_url, r"/data_directory"),
            DataDirectoryHandler,
        ),
        (
            url_path_join(backend_url, r"/download/(.*)"),
            tornado.web.StaticFileHandler,
            {"path": str(data_path)},
        ),
        (url_path_join(backend_url, "/login"), LoginHandler),
        (url_path_join(backend_url, r"/user"), UserInfoHandler),
        (url_path_join(backend_url, r"/resources"), ListUserHydroShareResources),
        # (url_path_join(backend_url, r"/resources/([^/]+)"), ResourceHandler),
        (
            url_path_join(backend_url, r"/resources/([^/]+)"),
            ListHydroShareResourceFiles,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/download"),
            HydroShareResourceHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/upload"),
            LocalResourceEntityHandler,
        ),
        (
            url_path_join(backend_url, r"/resources/([^/]+)/download/(.+)"),
            HydroShareResourceEntityHandler,
        ),
        # Put this last to catch everything else
        # order does matter
        # Host patterns are processed sequentially in the order they were added. All matching patterns will be considered.
        (frontend_url + r".*", WebAppHandler),
    ]
