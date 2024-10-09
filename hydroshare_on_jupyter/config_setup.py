from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import pickle
from pathlib import Path
from typing import Optional, Union
from .utilities.pathlib_utils import first_existing_file, expand_and_resolve
from .models.oauth import OAuthFile

_DEFAULT_CONFIG_FILE_LOCATIONS = (
    "~/.config/hydroshare_on_jupyter/config",
    "~/.hydroshare_on_jupyter_config",
)

_DEFAULT_DATA_PATH = expand_and_resolve("~/hydroshare")
_DEFAULT_LOG_PATH = expand_and_resolve("~/hydroshare/logs")


class FileNotDirectoryError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)


class ConfigFile(BaseSettings):
    # case-insensitive alias values DATA and LOG
    data_path: Optional[Path] = Field(_DEFAULT_DATA_PATH, validation_alias="data")
    log_path: Optional[Path] = Field(_DEFAULT_LOG_PATH, validation_alias="log")
    oauth_path: Union[OAuthFile, str, None] = Field(None, validation_alias="oauth")

    model_config = SettingsConfigDict(
        env_file=first_existing_file(_DEFAULT_CONFIG_FILE_LOCATIONS),
        env_file_encoding='utf-8'
    )
    # TODO: cleanup
    # class Config:
    #     env_file: Union[str, None] = first_existing_file(_DEFAULT_CONFIG_FILE_LOCATIONS)
    #     env_file_encoding = "utf-8"

    @model_validator(mode="after")
    def create_paths_if_do_not_exist(self):

        def check_path(path: Path):
            path = expand_and_resolve(path)
            if path.is_file():
                raise FileNotDirectoryError(
                    f"Configuration path: {str(path)} is a file not a directory."
                )
            elif not path.exists():
                path.mkdir(parents=True)

        check_path(self.data_path)
        check_path(self.log_path)
        return self

    @field_validator("oauth_path")
    def unpickle_oauth_path(cls, v):
        if v is None:
            return v
        path = expand_and_resolve(v)
        if not path.is_file():
            error_message = "Provided OAUTH configuration value must be file."
            raise FileNotFoundError(error_message)

        with open(path, "rb") as f:
            deserialized_model = pickle.load(f)

        return OAuthFile.model_validate(deserialized_model)
