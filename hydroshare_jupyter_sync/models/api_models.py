from pydantic import BaseModel, Field, StrictStr, StrictBool


class Credentials(BaseModel):
    username: StrictStr = Field(...)
    password: StrictStr = Field(...)


class Success(BaseModel):
    success: StrictBool = Field(...)
