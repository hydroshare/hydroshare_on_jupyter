from pydantic import BaseModel, Field, StrictStr, StrictBool


class Credentials(BaseModel):
    username: StrictStr = Field(...)
    password: StrictStr = Field(...)
    remember: StrictBool = Field(False)  # default False


class Success(BaseModel):
    success: StrictBool = Field(...)
