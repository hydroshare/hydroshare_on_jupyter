from pydantic import BaseModel, Field, StrictStr, StrictBool
from typing import List


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
