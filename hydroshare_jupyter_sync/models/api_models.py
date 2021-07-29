from hsmodels.schemas import resource
from pydantic import (
    BaseModel,
    Field,
    StrictStr,
    StrictBool,
    conlist,
    constr,
    ConstrainedList,
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