from abc import ABC, abstractmethod
from collections import UserDict
from pathlib import Path
from typing import List, Union
from hsclient import HydroShare
from concurrent.futures import ThreadPoolExecutor, as_completed

from .fs_resource_map import (
    RemoteFSResourceMap,
    LocalFSResourceMap,
)

from .types import ResourceId


# Abstract Interfaces


class IFSMap(ABC):
    """Abstract interface describing a FSMap's verbs (methods)"""

    @classmethod
    @abstractmethod
    def create_map(cls) -> "FSMap":
        """Create a new file system map instance from a provided root location.
        Note, subclasses overload this method."""

    @abstractmethod
    def add_resource(self, resource_id: ResourceId) -> None:
        """Create new FSResourceMap and add to the FSMap instance"""

    @abstractmethod
    def delete_resource(self, resource_id: ResourceId) -> None:
        """Remove FSResourceMap instance from FSMap instance"""

    @abstractmethod
    def update_resource(self, resource_id: ResourceId) -> None:
        """Update FSResourceMap instance in FSMap instance"""


class IEntityFSMap(ABC):
    """Abstract interface describing FSMap verbs (methods) that operate on FS entities."""

    @abstractmethod
    def add_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Remove a file in a FSResourceMap for a given resource id."""

    @abstractmethod
    def delete_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Remove a file in a FSResourceMap for a given resource id."""

    @abstractmethod
    def update_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Update a file in a FSResourceMap for a given resource id."""


# Semi-concrete implementations


class FSMap(UserDict, IFSMap, ABC):
    """Class representing the relationship between HydroShare resource's, resource files, and
    resource MD5 Hashes."""

    def delete_resource(self, resource_id: ResourceId) -> None:
        """Remove FSResourceMap instance from FSMap instance"""
        if resource_id in self.data:
            del self.data[resource_id]

    def update_resource(self, resource_id: ResourceId) -> None:
        """Update the FSResourceMap for a given resource id."""
        if resource_id in self.data:
            self.data[resource_id].update_resource()

    @property
    def resources(self) -> List[str]:
        """Return list of resources."""
        return list(self.data.keys())

    def _get_resource_ids(self) -> List[ResourceId]:
        """Get list of resource ids. Resource ids are parsed from directory names and are assumes to
        be direct children of the `fs_root` directory. Valid resource id names are also assumed to
        be 32 characters long (length of md5 hash) per the bagit specification
        (https://tools.ietf.org/html/draft-kunze-bagit-13). HydroShare uses md5 for creating
        resource id's."""
        return (
            [d.name for d in self.fs_root.glob("*") if len(d.name) == 32 and d.is_dir()]
            if self.fs_root
            else []
        )


# Concrete implementations


class LocalFSMap(FSMap, IEntityFSMap):
    """Class representing the relationship between *local* HydroShare resources', resource files,
    and resource MD5 Hashes."""

    def __init__(self, fs_root: Union[str, Path]) -> None:
        super().__init__()
        self.fs_root = Path(fs_root).expanduser().resolve()

    # override
    @classmethod
    def create_map(cls, fs_root: Union[Path, str]) -> "LocalFSMap":
        # create class instance
        fs_map = cls(fs_root)

        for resource in fs_map._get_resource_ids():
            # create new instance of LocalFSResourceMap
            fs_map[resource] = LocalFSResourceMap(fs_map.fs_root / resource)

        return fs_map

    def add_resource(self, resource_id: ResourceId) -> None:
        """Create new LocalFSResourceMap and add to LocalFSMap instance. `resource_id` provided must
        be direct child directory of `fs_root`."""
        if resource_id not in self.data:
            # create new local resource map
            r_map = LocalFSResourceMap.from_resource_path(self.fs_root / resource_id)

            # add local resource map to dictionary
            self.data[resource_id] = r_map

    def add_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        if resource_id in self.data:
            self.data[resource_id].add_file(relative_resource_file)

    def update_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Update a file in a LocalFSResourceMap instance for a given resource id."""
        if resource_id in self.data:
            self.data[resource_id].update_file(relative_resource_file)

    def delete_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Remove a file in a LocalFSResourceMap instance for a given resource id."""
        if resource_id in self.data:
            self.data[resource_id].delete_file(relative_resource_file)


class RemoteFSMap(FSMap):
    """Class representing the relationship between remote HydroShare resource's, resource files, and
    resource MD5 Hashes."""

    def __init__(self, fs_root: Union[str, Path], hydroshare: HydroShare) -> None:
        super().__init__()
        self.fs_root = Path(fs_root).expanduser().resolve()
        self._hydroshare = hydroshare

    # override
    @classmethod
    def create_map(
        cls, fs_root: Union[Path, str], hydroshare: HydroShare
    ) -> "RemoteFSMap":
        # create class instance
        fs_map = cls(fs_root, hydroshare)

        # NOTE: assumes user if logged in and using standard username, pass auth. Likely should
        # guard in future.
        # get username
        # TODO: Remove
        # username = hydroshare._hs_session._session.auth[0]

        # NOTE: assumes only resources desired for tracking are owned. may not be desirable.
        # get resources the user can edit
        remote_resources = {
            res.resource_id for res in hydroshare.search(edit_permission=True)
        }

        # naively get local resources based on fs_root location and directory name length
        naive_local_resources = set(fs_map._get_resource_ids())

        # resources s.t. user is owner and some files from res are local
        users_local_resources = naive_local_resources & remote_resources

        # create hsclient.HydroShare.Resource object for each resource that is naively on the local fs
        res_objs = [
            fs_map._hydroshare.resource(res_id) for res_id in users_local_resources
        ]

        # NOTE: should probably move this to a method and/or strategy pattern.
        # see https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ThreadPoolExecutor
        # ThreadPoolExecutor max_workers
        with ThreadPoolExecutor(max_workers=None) as executor:
            # create RemoteFSResourceMap instances for each resource and populate checksums
            futures = {
                # key: Future, value: HydroShare resource id
                executor.submit(RemoteFSResourceMap.from_resource, res): res.resource_id
                for res in res_objs
            }

            for fut_ref in as_completed(futures):
                res_id = futures[fut_ref]
                res_map = fut_ref.result()

                fs_map.data[res_id] = res_map

        return fs_map

    def add_resource(self, resource_id: ResourceId) -> None:
        """Create new RemoteFSResourceMap and add to the FSMap instance"""
        if resource_id not in self.data:
            res = self._hydroshare.resource(resource_id)
            res_map = RemoteFSResourceMap.from_resource(res)

            self.data[resource_id] = res_map
