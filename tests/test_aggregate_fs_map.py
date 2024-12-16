import pytest
import os
from hsclient import HydroShare
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from hydroshare_on_jupyter.lib.filesystem.aggregate_fs_map import AggregateFSMap


def get_env_file_path() -> Path:
    env_file = Path(__file__).resolve().parent.parent
    return env_file / ".env"


class HydroShareCreds(BaseSettings):
    username: str = Field(..., validation_alias="HYDRO_USERNAME")
    password: str = Field(..., validation_alias="HYDRO_PASSWORD")

    model_config = SettingsConfigDict(env_file=get_env_file_path(), env_file_encoding="utf-8")


@pytest.fixture
def hydroshare():
    creds = HydroShareCreds()
    hs = HydroShare(**creds.model_dump())
    return hs


@pytest.fixture
def test_dir():
    return Path(__file__).parent.resolve()


def test_create_aggregate_fs_map(hydroshare, test_dir):
    fs_root = test_dir
    agg_map = AggregateFSMap.create_map(fs_root, hydroshare)
    print(agg_map.get_sync_state())
