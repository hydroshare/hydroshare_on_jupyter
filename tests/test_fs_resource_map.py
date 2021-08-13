from tempfile import TemporaryDirectory
from pathlib import Path
import random
import string
from hashlib import md5
import pytest
from typing import Tuple, NewType

from hydroshare_jupyter_sync.lib.filesystem.fs_resource_map import LocalFSResourceMap

# type declarations
ResourcePath = NewType("ResourcePath", Path)
DataDir = NewType("DataDir", Path)


# helper functions
def random_string(size: int = 12, chars: str = string.ascii_letters + string.digits):
    # from https://stackoverflow.com/a/2257449
    return "".join(random.choice(chars) for _ in range(size))


def create_resource_id(random_string_size: int = 12) -> str:
    rand_bytes = random_string(size=random_string_size).encode()
    return md5(rand_bytes).hexdigest()


# fixtures
@pytest.fixture
def resource_mock() -> Tuple[ResourcePath, DataDir]:
    resource_name = create_resource_id()

    with TemporaryDirectory() as temp_dir:
        # resolve symlinks. without, causes issues on mac b.c. /var is symlinked to /private/var
        temp_dir = Path(temp_dir).resolve()

        # create intermediate data dir following bagit layout
        data_dir = temp_dir / resource_name / resource_name / "data" / "contents"
        data_dir.mkdir(parents=True)

        yield temp_dir / resource_name, data_dir


# tests
def test_local_fs_resource_map(resource_mock):
    rdir, data_dir = resource_mock
    fsmap = LocalFSResourceMap(rdir)

    assert fsmap.base_directory == rdir / rdir.name
    assert fsmap.data_path == data_dir


def test_local_fs_resource_map_add_file(resource_mock):
    rdir, data_dir = resource_mock
    fsmap = LocalFSResourceMap(rdir)

    # create test file
    fn = "test"
    test_file = data_dir / fn
    test_file.touch()

    relative_location = f"data/contents/{fn}"

    assert Path(relative_location) not in fsmap
    fsmap.add_file(test_file)
    assert relative_location not in fsmap
    assert Path(relative_location) in fsmap


def test_local_fs_resource_map_delete_file(resource_mock):
    rdir, data_dir = resource_mock
    fsmap = LocalFSResourceMap(rdir)

    # create test file
    fn = "test"
    test_file = data_dir / fn
    test_file.touch()

    relative_location = f"data/contents/{fn}"

    fsmap.add_file(test_file)
    assert Path(relative_location) in fsmap
    fsmap.delete_file(relative_location)
    assert Path(relative_location) not in fsmap


def test_local_fs_resource_map_update_file(resource_mock):
    rdir, data_dir = resource_mock
    fsmap = LocalFSResourceMap(rdir)

    # create test file
    fn = "test"
    test_file = data_dir / fn
    test_file.touch()

    relative_location = f"data/contents/{fn}"
    p_relative_location = Path(relative_location)

    fsmap.add_file(test_file)
    assert p_relative_location in fsmap

    # current md5
    file_hash = fsmap[p_relative_location]

    # write new stuff to file
    test_file.write_text("some test data")

    # try to update the file using incorrect relative location
    fsmap.update_file(fn)
    assert file_hash == fsmap[p_relative_location]

    # try to update the file using incorrect absolute location
    fsmap.update_file(f"/{fn}")
    assert file_hash == fsmap[p_relative_location]

    fsmap.update_file(relative_location)
    new_file_hash = fsmap[p_relative_location]
    assert file_hash != new_file_hash


def test_local_fs_resource_map_update_resource(resource_mock):
    rdir, data_dir = resource_mock

    # create test file
    files = []
    for i in range(10):
        fn = f"test_{i}"
        # Create test file
        test_file = data_dir / fn
        test_file.touch()
        files.append(test_file)

    fsmap = LocalFSResourceMap.from_resource_path(rdir)
    for i in range(5):
        fsmap.delete_file(files[i])
        files.pop(i)

    assert len(fsmap.files) == len(files)
