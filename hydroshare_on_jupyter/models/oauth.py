from pydantic import BaseModel, RootModel
from hsclient import Token

# typing imports
from typing import Tuple, Union, Literal, Any, Optional


OAuthFile = RootModel[Tuple[Token, str]]

# TODO: cleanup - also fix the imports above
# class OAuthFile(RootModel, BaseModel):
#     root: Tuple[Token, str]
#     def model_dump(
#         self,
#         *,
#         mode: Literal['json', 'python'] | str = 'python',
#         include: "IncEx" = None,
#         exclude: "IncEx" = None,
#         context: dict[str, Any] | None = None,
#         by_alias: bool = False,
#         exclude_unset: bool = False,
#         exclude_defaults: bool = False,
#         exclude_none: bool = False,
#         round_trip: bool = False,
#         warnings: bool | Literal['none', 'warn', 'error'] = True,
#         serialize_as_any: bool = False,
#     ) -> dict[str, Any]:
#         d = super().model_dump(
#             mode=mode,
#             include=include,
#             exclude=exclude,
#             context=context,
#             by_alias=by_alias,
#             exclude_unset=exclude_unset,
#             exclude_defaults=exclude_defaults,
#             exclude_none=exclude_none,
#             round_trip=round_trip,
#             warnings=warnings,
#             serialize_as_any=serialize_as_any,
#         )
#         # drop __root__, return only inner model
#         print(d)
#         root, _ = d
#         return self.root
