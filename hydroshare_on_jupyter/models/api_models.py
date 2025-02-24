from pydantic import (
    RootModel,
    BaseModel,
    Field,
    StrictStr,
    StrictBool,
    field_validator,
    ConfigDict,
    StringConstraints,
)
from typing import List, Union, Annotated
from hsclient import Token

from .resource_type_enum import ResourceTypeEnum


class ModelNoExtra(BaseModel):
    """does not permit extra fields"""

    model_config = ConfigDict(extra="forbid")


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

Credentials = RootModel[CredentialTypes]


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
    @field_validator("authors", mode="before")
    def handle_null_author(cls, v):
        return v or []

    @field_validator("creator", mode="before")
    def handle_null_creator(cls, v):
        return "" if v is None else v


class CollectionOfResourceMetadata(RootModel):
    # from https://github.com/samuelcolvin/pydantic/issues/675#issuecomment-513029543
    root: List[ResourceMetadata]


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


def get_res_file_type():
    return Annotated[str, StringConstraints(pattern=r"^((?!~|\.{2}).)*$")]

class ResourceFiles(BaseModel):
    # str in list cannot contain .. or ~
    files: List[get_res_file_type()] = Field(...)

    model_config = ConfigDict(regex_engine='python-re')


class DataDir(BaseModel):
    data_directory: str = Field(...)


class ServerRootDir(BaseModel):
    server_root: str = Field(...)
