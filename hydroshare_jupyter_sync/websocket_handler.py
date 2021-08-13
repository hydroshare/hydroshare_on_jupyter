from functools import partial
from tornado.websocket import WebSocketHandler
from http import HTTPStatus
import logging
import asyncio

from .server import SessionMixIn

# from .session import event_broker, session_sync_struct as session
from .session import session_sync_struct as session


class FileSystemEventWebSocketHandler(SessionMixIn, WebSocketHandler):
    def prepare(self):
        # get current running event loop in main thread
        self.loop = asyncio.get_event_loop()

        if not self.get_client_server_cookie_status():
            self.set_status(HTTPStatus.FOUND)  # 302
            # append requested uri as `next` Location parameter
            uri = self.request.uri
            self.redirect(f"{self.get_login_url()}?next={uri}")

    def open(self, *args, **kwargs):
        # ignore args and kwargs

        # send initial state/status
        message = session.aggregate_fs_map.get_sync_state().json()
        logging.info(f"opening message {message}")
        self.write_message(message)

        # subscribe to FSEvents
        session.event_broker.subscribe("STATUS", self._get_resource_status)

    def on_message(self, message):
        # message handler
        logging.info(message)
        self.write_message("You said " + message)

    def on_close(self):
        # unsubscribe to FSEvents
        session.event_broker.unsubscribe("STATUS", self._get_resource_status)

    def _get_resource_status(self, res_id: str) -> str:
        """Write json stringified resource sync state"""
        # NOTE: It is possible for aggregate_fs_map to be None if the user has not logged in.
        # this state should not occur if the user is logged in.
        message = session.aggregate_fs_map.get_resource_sync_state(res_id).json()
        logging.info(message)
        call = partial(self.write_message, message)
        self.loop.call_soon_threadsafe(call)
