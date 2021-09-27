from hsmodels.schemas import resource
from pydantic import (
    BaseModel,
    Field,
    StrictStr,
    StrictBool,
    conlist,
    constr,
    ConstrainedList,
    validator,
)
from typing import List
from .resource_type_enum import ResourceTypeEnum


class Boolean(BaseModel):
    value: bool

    @classmethod
    def get_value(cls, value: bool) -> bool:
        return cls(value=value).value


class Credentials(BaseModel):
    username: StrictStr = Field(...)
    password: StrictStr = Field(...)


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
