from pydantic import (
    RootModel,
    BaseModel,
    Field,
    StrictStr,
    StrictBool,
    constr,
    field_validator,
    ConfigDict,
    StringConstraints,
)
from typing import List, Union, Literal, Any, Annotated
from hsclient import Token

from .resource_type_enum import ResourceTypeEnum


class ModelNoExtra(BaseModel):
    """does not permit extra fields"""

    model_config = ConfigDict(extra="forbid")
    # TODO: cleanup - also cleanup imports above
    # class Config:
    #     extra = "forbid"


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

# TODO: cleanup
# class Credentials(RootModel, BaseModel):
#     root: CredentialTypes = Field(...)
#
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
#         # return contents of root key dropping it in the process
#         return d["root"]


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


ResFileType = Annotated[str, StringConstraints(pattern=r"^((?!~|\.{2}).)*$")]


class ResourceFiles(BaseModel):
    # str in list cannot contain .. or ~
    files: List[ResFileType] = Field(...)

    model_config = ConfigDict(regex_engine='python-re')


class DataDir(BaseModel):
    data_directory: str = Field(...)


class ServerRootDir(BaseModel):
    server_root: str = Field(...)
