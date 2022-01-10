from functools import partial
from tornado.websocket import WebSocketHandler
from http import HTTPStatus
import logging
import asyncio

from .server import SessionMixIn

# event types
from .fs_events import Events

# from .session import event_broker, session_sync_struct as session
from .session import session_sync_struct as session


class FileSystemEventWebSocketHandler(SessionMixIn, WebSocketHandler):
    def prepare(self):
        # get current running event loop in main thread
        self.loop = asyncio.get_event_loop()
        logging.info("got event loop")

        if not self.get_client_server_cookie_status():
            self.set_status(HTTPStatus.FOUND)  # 302
            # append requested uri as `next` Location parameter
            uri = self.request.uri
            self.redirect(f"{self.get_login_url()}?next={uri}")

    def open(self, *args, **kwargs):
        # ignore args and kwargs

        # send initial state/status
        message = session.aggregate_fs_map.get_sync_state().json()
        logging.info(message)
        self.write_message(message)

        # subscribe to FSEvents
        self._subscribe_to_events()
        logging.info("subscribed to events")

    def on_message(self, message):
        # message handler
        logging.info(message)

    def on_close(self):
        # unsubscribe to FSEvents
        self._unsubscribe_from_events()
        logging.info("unsubscribed from events")

    def _subscribe_to_events(self):
        session.event_broker.subscribe(Events.STATUS, self._get_resource_status)
        session.event_broker.subscribe(
            Events.RESOURCE_STATUS, self._get_resource_status
        )
        session.event_broker.subscribe(
            Events.RESOURCE_ENTITY_UPLOADED, self._get_resource_status
        )

    def _unsubscribe_from_events(self):
        # TODO: bug lifetime of event_broker not guaranteed. event_broker is destroyed by logout logic
        try:
            session.event_broker.unsubscribe(Events.STATUS, self._get_resource_status)
            session.event_broker.unsubscribe(
                Events.RESOURCE_STATUS, self._get_resource_status
            )
            session.event_broker.unsubscribe(
                Events.RESOURCE_ENTITY_UPLOADED, self._get_resource_status
            )
        except AttributeError as e:
            pass

    def _get_resource_status(self, res_id: str) -> str:
        """Write json stringified resource sync state"""
        # NOTE: It is possible for aggregate_fs_map to be None if the user has not logged in.
        # this state should not occur if the user is logged in.
        message = session.aggregate_fs_map.get_resource_sync_state(res_id).json()
        logging.info(message)
        call = partial(self.write_message, message)
        self.loop.call_soon_threadsafe(call)
