from dataclasses import dataclass
from hsclient import HydroShare
from watchdog.observers import Observer
import logging

# type hint imports
from typing import Optional, Union
from pathlib import Path

# lib imports
from .lib.filesystem.aggregate_fs_map import AggregateFSMap
from .lib.events.event_broker import EventBroker

# local imports
from .fs_event_handler import fs_event_handler_factory
from .fs_events import Events
from .session_struct_interface import ISessionSyncStruct
from .session_sync_event_listeners import SessionSyncEventListeners

_log = logging.getLogger(__name__)


@dataclass
class SessionStruct:
    session: Optional[HydroShare] = None
    cookie: Optional[bytes] = None
    id: Optional[int] = None
    username: Optional[str] = None

    @classmethod
    def create_empty(cls):
        return cls()

    def __eq__(self, o: Union[bytes, "SessionStruct"]) -> bool:
        """Check if self.cookie is equal to o. If self.cookie is none, False."""
        if self.cookie == None:
            return False
        if isinstance(o, SessionStruct):
            return self.cookie == o.cookie
        if not isinstance(o, bytes):
            return False
        return self.cookie == o


@dataclass
class SessionSyncStruct(ISessionSyncStruct):
    @classmethod
    def create_sync_struct(
        cls, fs_root: Union[Path, str], hydroshare: HydroShare
    ) -> "SessionSyncStruct":
        # instantiate and populate local and remote FSMaps
        agg_map = AggregateFSMap.create_map(fs_root, hydroshare)
        _log.info("created AggregateFSMap")

        event_broker = EventBroker(Events)
        # `event_broker` context given to each factory object
        _event_handler_factory = fs_event_handler_factory(event_broker)

        # create and start observer thread
        observer = Observer()
        _log.info("observer created")
        observer.start()
        _log.info("observer started")

        # mapping of resource_id to application specific watchdog FileSystemEventHandler instance
        fs_observers = dict()
        for res_id, res in agg_map.local_map.items():
            # create a resource specific event handler
            event_handler = _event_handler_factory(res)

            _log.info(f"scheduling {res_id} observer")
            # bind handler to observer
            watcher = observer.schedule(
                event_handler, res.contents_path, recursive=True
            )

            fs_observers[res_id] = watcher

        # setup event listeners
        SessionSyncEventListeners(
            aggregate_fs_map=agg_map,
            event_broker=event_broker,
            observer=observer,
            fs_observers=fs_observers,
            event_handler_factory=_event_handler_factory,
        ).setup_event_listeners()
        _log.info("event listeners setup")

        return cls(
            aggregate_fs_map=agg_map,
            event_broker=event_broker,
            observer=observer,
            fs_observers=fs_observers,
            event_handler_factory=_event_handler_factory,
        )

    @classmethod
    def init_sync_struct(
        cls, fs_root: Union[Path, str], hydroshare: HydroShare
    ) -> "SessionSyncStruct":
        # instantiate and populate local and remote FSMaps
        # NOTE: call with large overhead
        agg_map = AggregateFSMap.create_empty_map(fs_root, hydroshare)
        _log.info("created empty AggregateFSMap")

        event_broker = EventBroker(Events)
        # `event_broker` context given to each factory object
        _event_handler_factory = fs_event_handler_factory(event_broker)

        # create and start observer thread
        observer = Observer()
        _log.info("observer created")
        observer.start()
        _log.info("observer started")

        # mapping of resource_id to application specific watchdog FileSystemEventHandler instance
        fs_observers = dict()

        # setup event listeners
        SessionSyncEventListeners(
            aggregate_fs_map=agg_map,
            event_broker=event_broker,
            observer=observer,
            fs_observers=fs_observers,
            event_handler_factory=_event_handler_factory,
        ).setup_event_listeners()
        _log.info("event listeners setup")

        return cls(
            aggregate_fs_map=agg_map,
            event_broker=event_broker,
            observer=observer,
            fs_observers=fs_observers,
            event_handler_factory=_event_handler_factory,
        )

    def shutdown(self) -> None:
        # unsubscribe from all event
        self._cleanup_event_broker()

        # cleanup observer: unschedule, stop, and rejoin thread
        self._cleanup_observer()

    def _cleanup_event_broker(self) -> None:
        """event broker cleanup logic"""
        if self.event_broker is not None:
            self.event_broker.unsubscribe_all()

    def _cleanup_observer(self) -> None:
        """observer cleanup logic"""
        if self.observer is not None:
            # unschedule all observers
            self.observer.unschedule_all()

            # join and stop observer
            self.observer.stop()
            self.observer.join()
