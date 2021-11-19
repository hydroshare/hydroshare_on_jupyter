import pytest
import pickle
from hydroshare_jupyter_sync.config_setup import ConfigFile, FileNotDirectoryError
from tempfile import TemporaryDirectory, TemporaryFile
from pathlib import Path


def test_config_file():
    with TemporaryDirectory() as temp:
        log = Path(temp) / "logs"
        ConfigFile(data_path=temp, log_path=log)


def test_config_log_is_file():
    with pytest.raises(FileNotDirectoryError):
        with TemporaryDirectory() as temp:
            log = Path(temp) / "logs"
            log.touch()
            ConfigFile(data_path=temp, log_path=log)


def test_config_using_env_vars(monkeypatch):
    """Test configuration using environment variables"""
    with TemporaryDirectory() as temp:
        temp = Path(temp).resolve()
        log = (Path(temp) / "logs").resolve()
        monkeypatch.setenv("DATA", str(temp))
        monkeypatch.setenv("LOG", str(log))
        c = ConfigFile()
        assert str(c.data_path) == str(temp)
        assert str(c.log_path) == str(log)


def test_config_using_env_file():
    """Test configuration using environment variables"""
    with TemporaryDirectory() as temp:
        log = Path(temp) / "logs"
        env_contents = f"""
        DATA={temp}
        LOG={log}
        """
        env_file = Path(temp) / "env"
        with open(env_file, "w") as f:
            f.write(env_contents)

        c = ConfigFile(_env_file=env_file)
        assert str(c.data_path) == str(temp)
        assert str(c.log_path) == str(log)


@pytest.fixture
def oauth_data():
    return [
        {
            "access_token": "some_fake_token",
            "token_type": "Bearer",
            "refresh_token": "some_fake_token",
            "scope": "scope",
            "expires_in": 2592000,
        },
        "some_fake_token",
    ]


@pytest.fixture
def oauth_file(oauth_data) -> Path:

    filename = ".hs_auth"
    with TemporaryDirectory() as dir:
        oauth_path = Path(dir) / filename
        with open(oauth_path, "wb") as f:
            pickle.dump(oauth_data, f, protocol=2)
        yield oauth_path


def test_config_oauth(oauth_file, oauth_data):
    o = ConfigFile(oauth_path=oauth_file)
    assert o.oauth_path.access_token == oauth_data[0]["access_token"]
