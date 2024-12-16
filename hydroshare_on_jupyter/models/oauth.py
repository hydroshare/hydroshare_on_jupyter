from pydantic import BaseModel, RootModel
from hsclient import Token

from typing import Tuple, Union, Literal, Any, Optional


OAuthFile = RootModel[Tuple[Token, str]]
