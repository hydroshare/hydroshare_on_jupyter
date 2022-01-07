from typing import Callable, Union
from pathlib import Path
from hsclient import HydroShare
from functools import partial

from .session_struct import SessionSyncStruct


class _SessionSyncSingleton:
    def __init__(self) -> None:

        # Create empty session sync struct
        self.reset_session()

    def new_sync_session(
        self, fs_root: Union[Path, str], hydroshare: HydroShare
    ) -> None:
        # greedily fill fs aggregate map with local resources and checksums from HS.
        # this implicates a delay, directly post login, for a user to hit any server endpoint.
        # wait time is linearly related to the number of local resources (that the user is an editor of)
        # this is detrimental if a user attempts to hit an endpoint or connect via websocket during the wait time.
        # specifically, this can cause unintended timeouts
        # OLD IMPLEMENTATION. Retaining for historical clarity
        # new_session = partial(SessionSyncStruct.create_sync_struct, fs_root, hydroshare)

        # lazily fill fs aggregate map. local file system is not searched for local resources that
        # an HS user is an editor of until they try to list the files in a specified resource.
        # this resolves the issues mentioned above
        new_session = partial(SessionSyncStruct.init_sync_struct, fs_root, hydroshare)
        self._handle_session(new_session)

    def reset_session(self) -> None:
        # create empty session sync struct
        self._handle_session(SessionSyncStruct)

    @property
    def is_empty(self) -> bool:
        # ignore shutdown fn when verifying if any attrs are not empty
        return not any(v for k, v in self.__dict__.items() if k != "shutdown")

    # helpers
    def _handle_session(self, session: Callable[[], SessionSyncStruct]):
        # shutdown any open previous resources
        try:
            self.shutdown()
        except AttributeError:
            # on __init__, shutdown attribute will not be set
            ...

        # create session instance
        session = session()
        # re-bind shutdown method to singleton instance
        self.shutdown = session.shutdown

        self._update_attrs(session)

    def _update_attrs(self, o: object) -> None:
        attrs = o.__dict__
        for attr, value in attrs.items():
            setattr(self, attr, value)


# create empty session
session_sync_struct = _SessionSyncSingleton()
