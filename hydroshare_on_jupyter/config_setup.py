from pydantic import BaseSettings, Field, root_validator, validator
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
    data_path: Path = Field(_DEFAULT_DATA_PATH, env="data")
    log_path: Path = Field(_DEFAULT_LOG_PATH, env="log")
    oauth_path: Union[OAuthFile, str, None] = Field(None, env="oauth")

    class Config:
        env_file: Union[str, None] = first_existing_file(_DEFAULT_CONFIG_FILE_LOCATIONS)
        env_file_encoding = "utf-8"

    @validator("data_path", "log_path", pre=True)
    def create_paths_if_do_not_exist(cls, v: Path):
        # for key, path in values.items():
        path = expand_and_resolve(v)
        if path.is_file():
            raise FileNotDirectoryError(
                f"Configuration path: {str(path)} is a file not a directory."
            )
        elif not path.exists():
            path.mkdir(parents=True)
        return path

    @validator("oauth_path")
    def unpickle_oauth_path(cls, v):
        if v is None:
            return v
        path = expand_and_resolve(v)
        if not path.is_file():
            error_message = "Provided OAUTH configuration value must be file."
            raise FileNotFoundError(error_message)

        with open(path, "rb") as f:
            deserialized_model = pickle.load(f)

        return OAuthFile.parse_obj(deserialized_model)
