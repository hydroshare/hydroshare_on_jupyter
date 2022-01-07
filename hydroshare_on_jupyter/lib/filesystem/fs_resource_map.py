from abc import ABC, abstractmethod
from collections import UserDict
from typing import List, Union
from hsclient import Resource
from pathlib import Path

# local imports
from .utilities import compute_file_md5_hexdigest, get_resource_checksums


# abstract interfaces


class IFSResourceMap(ABC):
    """Class representing the relationship between a file (no directory) path to the file's MD5 Hash."""

    @abstractmethod
    def update_resource(self) -> None:
        """Update entire resource map. md5hash's updated, non-existent files removed, and new files inserted."""


class IEntityFSResourceMap(ABC):
    """Class representing the relationship between a file (no directory) path to the file's MD5 Hash."""

    @abstractmethod
    def add_file(self, relative_resource_file: Union[Path, str]) -> None:
        """Add file to FSResource map."""

    @abstractmethod
    def delete_file(self, relative_resource_file: Union[Path, str]) -> None:
        """Remove file from FSResource map."""

    @abstractmethod
    def update_file(self, relative_resource_file: Union[Path, str]) -> None:
        """Update file in FSResource map."""


# semi-concrete implementations


class FSResourceMap(UserDict, IFSResourceMap):
    @property
    def files(self) -> List[Path]:
        """Return list of files in resource."""
        return list(self.data.keys())


# concrete implementations


class LocalFSResourceMap(FSResourceMap, IEntityFSResourceMap):
    """Concrete class representing the relationship between a local file (not directory) path to the file's MD5 Hash."""

    def __init__(self, resource_path: Union[Path, str]) -> None:
        super().__init__()
        self.resource_path = Path(resource_path).expanduser().resolve()
        self.resource_id = resource_path.name

    @classmethod
    def from_resource_path(
        cls, resource_path: Union[Path, str]
    ) -> "LocalFSResourceMap":
        # create class instance
        fsresource_map = cls(resource_path)

        fsresource_map.update_resource()
        return fsresource_map

    def add_file(self, relative_resource_file: Union[Path, str]) -> None:
        if self._valid_resource_file(relative_resource_file) and not self._is_member(
            relative_resource_file
        ):
            self._insert(relative_resource_file)

    def update_file(self, relative_resource_file: Union[Path, str]) -> None:
        if self._is_member(relative_resource_file):
            self._insert(relative_resource_file)

    def delete_file(self, relative_resource_file: Union[Path, str]) -> None:
        if self._is_member(relative_resource_file):
            relative_resource_file = self._as_child_of_base_directory(
                relative_resource_file
            )
            del self.data[relative_resource_file]

    def update_resource(self) -> None:
        # clear data dictionary
        self.data = dict()
        for resource_file in self.contents_path.glob("**/*"):
            # insert relative file path to contents_path and md5 digest
            self._insert(resource_file)

    @property
    def base_directory(self) -> Path:
        """Return assumed path to base directory (i.e. `/some/path/{resource_id}/{resource_id}`).

        The property name, `base_directory`, was chosen based on nameing conventions found in any
        HydroShare resource's `readme.txt`"""
        return self.resource_path / self.resource_id

    @property
    def contents_path(self):
        """Return assumed path to resource data (i.e. `/some/path/{resource_id}/{resource_id}/data/contents`)"""
        return self.base_directory / "data" / "contents"

    # Helper methods
    def _abs_path(self, resource_file: Union[Path, str]) -> Path:
        resource_file = Path(resource_file)
        return (
            resource_file
            if resource_file.is_absolute()
            else self.base_directory / resource_file
        ).resolve()

    def _is_member(self, resource_file: Union[Path, str]) -> bool:
        if self._is_child_of_contents_path(resource_file):
            return self._as_child_of_base_directory(resource_file) in self.data
        return False

    def _valid_resource_file(self, resource_file: Union[Path, str]) -> bool:
        abs_path = self._abs_path(resource_file)

        return (
            abs_path.is_file()
            and not abs_path.is_symlink()
            and self._is_child_of_contents_path(abs_path)
        )

    def _as_child_of(
        self, resource_file: Union[Path, str], parents: Union[Path, str]
    ) -> Path:
        abs_path = self._abs_path(resource_file)
        return abs_path.relative_to(parents)

    def _as_child_of_contents_path(self, resource_file: Union[Path, str]) -> Path:
        return self._as_child_of(resource_file, self.contents_path)

    def _as_child_of_base_directory(self, resource_file: Union[Path, str]) -> Path:
        return self._as_child_of(resource_file, self.base_directory)

    def _is_child_of_contents_path(self, resource_file: Union[Path, str]) -> bool:
        try:
            # ensure is child of contents_path
            self._as_child_of_contents_path(resource_file)
            return True
        except ValueError:
            return False

    def _insert(self, resource_file: Union[Path, str]) -> None:
        abs_path = self._abs_path(resource_file)

        if self._valid_resource_file(abs_path):
            # path relative to resource base directory. For comparison, this is how files are listed
            # in any resource's `manifest-md5.txt` file.
            truncated_path = abs_path.relative_to(self.base_directory)
            # compute file md5 hex digest
            digest = compute_file_md5_hexdigest(abs_path)
            # insert into collection
            self.data[truncated_path] = digest


class RemoteFSResourceMap(FSResourceMap):
    def __init__(self, resource: Resource) -> None:
        super().__init__()
        self.resource = resource
        self.resource_id = resource.resource_id

    @classmethod
    def from_resource(cls, resource: Resource) -> "FSResourceMap":
        # create class instance
        fsresource_map = cls(resource)

        fsresource_map.update_resource()
        return fsresource_map

    def update_resource(self) -> None:
        # clear instance data dictionary
        self.data = dict()

        # force resource to re-fetch manifest-md5.txt from hs
        self.resource._parsed_checksums = None

        self.data = get_resource_checksums(self.resource)
