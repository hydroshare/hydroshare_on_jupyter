from pydantic import BaseSettings, Field, root_validator
from pathlib import Path
from typing import Union
from .utilities.pathlib_utils import first_existing_file, expand_and_resolve

_DEFAULT_CONFIG_FILE_LOCATIONS = (
    "~/.config/hydroshare_jupyter_sync/config",
    "~/.hydroshare_jupyter_sync_config",
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

    class Config:
        env_file: Union[str, None] = first_existing_file(_DEFAULT_CONFIG_FILE_LOCATIONS)
        env_file_encoding = "utf-8"

    @root_validator
    def create_paths_if_do_not_exist(cls, values: dict):
        for key, path in values.items():
            path = expand_and_resolve(path)
            if path.is_file():
                raise FileNotDirectoryError(
                    f"Configuration setting: {key}={str(path)} is a file not a directory."
                )
            elif not path.exists():
                path.mkdir()

        return values
