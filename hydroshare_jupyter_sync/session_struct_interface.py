from dataclasses import dataclass

# type hint imports
from typing import Callable, Dict, Optional
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from .lib.events.event_broker import EventBroker
from .lib.filesystem.types import ResourceId
from .lib.filesystem.aggregate_fs_map import AggregateFSMap
from .lib.filesystem.fs_resource_map import LocalFSResourceMap


@dataclass
class ISessionSyncStruct:
    aggregate_fs_map: Optional[AggregateFSMap] = None
    event_broker: Optional[EventBroker] = None
    observer: Optional[Observer] = None
    fs_observers: Optional[Dict[ResourceId, FileSystemEventHandler]] = None
    event_handler_factory: Optional[
        Callable[[LocalFSResourceMap], FileSystemEventHandler]
    ] = None
