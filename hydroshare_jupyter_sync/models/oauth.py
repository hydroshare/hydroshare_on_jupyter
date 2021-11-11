from pydantic import BaseModel

# typing imports
from typing import Tuple, Union


class OAuthContents(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    scope: str
    expires_in: str


class OAuthFile(BaseModel):
    __root__: Tuple[OAuthContents, str]

    def dict(
        self,
        *,
        include: Union["AbstractSetIntStr", "MappingIntStrAny"] = None,
        exclude: Union["AbstractSetIntStr", "MappingIntStrAny"] = None,
        by_alias: bool = False,
        skip_defaults: bool = None,
        exclude_unset: bool = False,
        exclude_defaults: bool = False,
        exclude_none: bool = False
    ) -> "DictStrAny":
        d = super().dict(
            include=include,
            exclude=exclude,
            by_alias=by_alias,
            skip_defaults=skip_defaults,
            exclude_unset=exclude_unset,
            exclude_defaults=exclude_defaults,
            exclude_none=exclude_none,
        )
        # drop __root__, return only inner model
        return d["__root__"]
