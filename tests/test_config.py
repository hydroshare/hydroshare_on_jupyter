import pytest
from hydroshare_jupyter_sync.config_setup import ConfigFile, FileNotDirectoryError
from tempfile import TemporaryDirectory
from pathlib import Path


def test_config_file():
    with TemporaryDirectory() as temp:
        log = Path(temp) / "logs"
        ConfigFile(data=temp, log=log)


def test_config_log_is_file():
    with pytest.raises(FileNotDirectoryError):
        with TemporaryDirectory() as temp:
            log = Path(temp) / "logs"
            log.touch()
            ConfigFile(data=temp, log=log)


def test_config_using_env_vars(monkeypatch):
    """Test configuration using environment variables"""
    with TemporaryDirectory() as temp:
        log = Path(temp) / "logs"
        monkeypatch.setenv("DATA", str(temp))
        monkeypatch.setenv("LOG", str(log))
        c = ConfigFile()
        assert str(c.data) == str(temp)
        assert str(c.log) == str(log)


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
        assert str(c.data) == str(temp)
        assert str(c.log) == str(log)
