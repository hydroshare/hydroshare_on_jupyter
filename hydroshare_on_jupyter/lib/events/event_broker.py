from typing import Callable, Dict, List
from enum import Enum


class EventBroker:
    def __init__(self, event_types: Enum) -> None:
        # enum name (not value) as event type name
        self.event_listeners: Dict[str, List[Callable]] = {
            event_name.name: list() for event_name in event_types
        }

        self._event_types = event_types

    def subscribe(self, event_name: str, fn) -> None:
        event_name = self._parse_enum(event_name)

        if event_name in self.event_listeners:
            self.event_listeners[event_name].append(fn)

    def unsubscribe(self, event_name: str, fn) -> None:
        event_name = self._parse_enum(event_name)

        if event_name in self.event_listeners:
            listeners = self.event_listeners[event_name]
            for idx, f in enumerate(listeners):
                if f == fn:
                    listeners.pop(idx)

    def dispatch(self, event_name: str, *args, **kwargs) -> None:
        event_name = self._parse_enum(event_name)

        if event_name in self.event_listeners:
            for fn in self.event_listeners[event_name]:
                fn(*args, **kwargs)

    def unsubscribe_all(self) -> None:
        for listeners in self.event_listeners.values():
            # clear event listeners
            listeners.clear()

    @property
    def events_types(self):
        return list(self.event_listeners.keys())

    def _parse_enum(self, event_name: str) -> str:
        if isinstance(event_name, self._event_types):
            return event_name.name
        return event_name
