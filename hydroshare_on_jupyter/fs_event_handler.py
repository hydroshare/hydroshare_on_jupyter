from watchdog.events import (
    FileSystemEventHandler,
    PatternMatchingEventHandler,
    FileCreatedEvent,
    FileModifiedEvent,
    FileDeletedEvent,
    FileMovedEvent,
    FileClosedEvent,
)

from .fs_events import Events
from .lib.filesystem.fs_resource_map import LocalFSResourceMap
from .lib.events.event_broker import EventBroker

from functools import wraps
from pathlib import Path
import logging

# module level log
logger = logging.getLogger(__name__)


def log_event(fn):
    @wraps(fn)
    def wrapper(self, event):
        logger.debug(event)
        return fn(self, event)

    return wrapper


def fs_event_handler_factory(event_broker: EventBroker) -> FileSystemEventHandler:
    """Wrap FSEventHandler in event_broker context. There should be only one resource per
    FSEventHandler instance."""

    class FSEventHandler(PatternMatchingEventHandler):
        def __init__(self, local_fs_map: LocalFSResourceMap):
            # TODO: use pattern kwarg to ignore certain files/file extensions. it would be nice if
            # this were a configurable.
            super().__init__(ignore_directories=True)

            # dependency inject local filesystem map
            self._res_map = local_fs_map

        @log_event
        def on_any_event(self, event):
            # log all events
            ...

        def on_created(self, event: FileCreatedEvent) -> None:
            # add file to local fs map
            self._res_map.add_file(event.src_path)

            # dispatch new state
            event_broker.dispatch(Events.STATUS, self.resource_id)

        def on_modified(self, event: FileModifiedEvent) -> None:
            # update file in local fs map
            self._res_map.update_file(event.src_path)

            # dispatch new state
            event_broker.dispatch(Events.STATUS, self.resource_id)

        def on_deleted(self, event: FileDeletedEvent) -> None:
            # imperatively check if the file exists. propagates from known issue with OSX's KQueue.
            # related to https://github.com/gorakhargosh/watchdog/issues/803
            if not Path(event.src_path).exists():
                # remove file from local fs map
                self._res_map.delete_file(event.src_path)

            # dispatch new state
            event_broker.dispatch(Events.STATUS, self.resource_id)

        def on_moved(self, event: FileMovedEvent) -> None:
            # update/add file in local fs map, remove file from local fs map
            self._res_map.delete_file(event.src_path)
            self._res_map.delete_file(event.dest_path)

            self._res_map.add_file(event.dest_path)

            # dispatch new state
            event_broker.dispatch(Events.STATUS, self.resource_id)

        def on_closed(self, event: FileClosedEvent) -> None:
            # update file in local fs map
            self._res_map.update_file(event.src_path)

            # dispatch new state
            event_broker.dispatch(Events.STATUS, self.resource_id)

        # properties
        @property
        def resource_id(self) -> str:
            return self._res_map.resource_id

    return FSEventHandler
