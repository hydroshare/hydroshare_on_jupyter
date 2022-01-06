from enum import Enum, auto

# type hint imports
from typing import Callable, Union
from pathlib import Path
from hsclient import HydroShare

# local imports
from .lib.filesystem.types import ResourceId

NOOP = lambda _: ...


class Events(Enum):
    LOGIN_SUCCESSFUL = auto()  # Callable[[Union[Path, str], HydroShare], None]
    STATUS = auto()  # Callable[[ResourceId], None]
    RESOURCE_DOWNLOADED = auto()  # Callable[[ResourceId], None]
    RESOURCE_ENTITY_DOWNLOADED = auto()  # Callable[[ResourceId], None]
    RESOURCE_ENTITY_UPLOADED = auto()  # Callable[[ResourceId], None]
    RESOURCE_FILES_LISTED = auto()  # Callable[[ResourceId], None]
    RESOURCE_STATUS = auto()  # Callable[[ResourceId], None]
    # TODO: implement below.
    LOGOUT = auto()  # NOOP
