from pydantic import (
    BaseModel,
    Field,
    StrictStr,
    StrictBool,
    constr,
    validator,
)
from typing import List, Union
from hsclient import Token

from .resource_type_enum import ResourceTypeEnum


class ModelNoExtra(BaseModel):
    """does not permit extra fields"""

    class Config:
        extra = "forbid"


class Boolean(BaseModel):
    value: bool

    @classmethod
    def get_value(cls, value: bool) -> bool:
        return cls(value=value).value


class StandardCredentials(ModelNoExtra):
    username: StrictStr = Field(...)
    password: StrictStr = Field(...)


class OAuthCredentials(ModelNoExtra):
    client_id: StrictStr = Field(...)
    token: Token = ...


CredentialTypes = Union[StandardCredentials, OAuthCredentials]


class Credentials(BaseModel):
    __root__: CredentialTypes = Field(...)

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
        # return contents of root key dropping it in the process
        return d["__root__"]


class Success(BaseModel):
    success: StrictBool = Field(...)


class ResourceMetadata(BaseModel):
    resource_type: str = Field(...)
    resource_title: str = Field(...)
    resource_id: str = Field(...)
    immutable: bool = Field(...)
    resource_url: str = Field(...)
    date_created: str = Field(...)
    date_last_updated: str = Field(...)
    creator: str = Field(...)
    authors: List[str] = Field(...)

    # NOTE: remove once https://github.com/hydroshare/hsclient/issues/23 has been resolved
    @validator("authors", pre=True, always=True)
    def handle_null_author(cls, v):
        return v or []

    @validator("creator", pre=True, always=True)
    def handle_null_creator(cls, v):
        return "" if v is None else v


class CollectionOfResourceMetadata(BaseModel):
    # from https://github.com/samuelcolvin/pydantic/issues/675#issuecomment-513029543
    __root__: List[ResourceMetadata]


class ResourceCreationRequest(BaseModel):
    title: str
    metadata: str
    extra_metadata: str
    edit_users: str
    edit_groups: str
    view_users: str
    view_groups: str
    keywords: List[str]
    abstract: str
    resource_type: ResourceTypeEnum


class ResourceFiles(BaseModel):
    # str in list cannot contain .. or ~
    files: List[constr(regex=r"^((?!~|\.{2}).)*$")] = Field(...)


class DataDir(BaseModel):
    data_directory: str = Field(...)
