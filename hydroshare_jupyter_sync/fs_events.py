from enum import Enum

# type hint imports
from typing import Callable, Union
from pathlib import Path
from hsclient import HydroShare

# local imports
from .lib.filesystem.types import ResourceId

NOOP = lambda _: ...


class Events(Enum):
    LOGIN_SUCCESSFUL = Callable[[Union[Path, str], HydroShare], None]
    STATUS = Callable[[ResourceId], None]
    RESOURCE_DOWNLOADED = Callable[[ResourceId], None]
    RESOURCE_ENTITY_DOWNLOADED = Callable[[ResourceId], None]
    RESOURCE_ENTITY_UPLOADED = Callable[[ResourceId], None]
    # TODO: implement below.
    LOGOUT = NOOP
