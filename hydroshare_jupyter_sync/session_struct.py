from dataclasses import dataclass
from hs_restclient import HydroShare

# type hint imports
from typing import Union


@dataclass
class SessionStruct:
    session: Union[HydroShare, None]
    cookie: Union[bytes, None]
    id: Union[int, None]

    def __eq__(self, o: Union[bytes, "SessionStruct"]) -> bool:
        """Check if self.cookie is equal to o. If self.cookie is none, False."""
        if self.cookie == None:
            return False
        if isinstance(o, SessionStruct):
            return self.cookie == o.cookie
        if not isinstance(o, bytes):
            return False
        return self.cookie == o
