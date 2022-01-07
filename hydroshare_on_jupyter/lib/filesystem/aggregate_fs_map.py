from dataclasses import dataclass
from typing import Tuple, Union
from pathlib import Path
from hsclient import HydroShare

from .fs_map import IFSMap, IEntityFSMap, LocalFSMap, RemoteFSMap
from .types import ResourceId, T
from .exceptions import AggregateFSMapResourceMembershipError
from .aggregate_fs_resource_map_sync_state import (
    AggregateFSResourceMapSyncState,
    AggregateFSResourceMapSyncStateCollection,
)


@dataclass
class AggregateFSMap(IFSMap, IEntityFSMap):
    local_map: LocalFSMap
    remote_map: RemoteFSMap

    # IFSMap implementations

    @classmethod
    def create_empty_map(
        cls, fs_root: Union[Path, str], hydroshare: HydroShare
    ) -> "AggregateFSMap":
        # create local and remote map instances
        remote_map = RemoteFSMap(fs_root, hydroshare)
        local_map = LocalFSMap(fs_root)

        return cls(local_map=local_map, remote_map=remote_map)

    @classmethod
    def create_map(
        cls, fs_root: Union[Path, str], hydroshare: HydroShare
    ) -> "AggregateFSMap":
        # create local and remote map instances
        remote_map = RemoteFSMap.create_map(fs_root, hydroshare)
        local_map = LocalFSMap(fs_root)

        # `remote_map` only contains resources that user owns and are local in fs_root.
        # Add those resources to local map
        for res in remote_map.keys():
            local_map.add_resource(res)

        return cls(local_map=local_map, remote_map=remote_map)

    def add_resource(self, resource_id: ResourceId) -> None:
        """Add resource to local and remote map"""
        self._map_fn(lambda o: o.add_resource(resource_id))

    def delete_resource(self, resource_id: ResourceId) -> None:
        """Remove resource from local and remote FSMap instances"""
        self._map_fn(lambda o: o.delete_resource(resource_id))

    def update_resource(self, resource_id: ResourceId) -> None:
        """Update a local and remote resource"""
        self._map_fn(lambda o: o.update_resource(resource_id))

    # IEntityFSMap implementations

    def add_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Add resource file to local map. Does not interact with the remote FS map."""
        self.local_map.add_resource_file(resource_id, relative_resource_file)

    def delete_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ) -> None:
        """Remove resource file from local map. Does not interact with the remote FS map."""
        self.local_map.delete_resource_file(resource_id, relative_resource_file)

    def update_resource_file(
        self, resource_id: ResourceId, relative_resource_file: Union[Path, str]
    ):
        """Update resource file in local map. Does not interact with the remote FS map."""
        self.local_map.update_resource_file(resource_id, relative_resource_file)

    # other methods

    def get_sync_state(self) -> AggregateFSResourceMapSyncStateCollection:
        """Get sync status of all resources in local and remote maps."""
        return AggregateFSResourceMapSyncStateCollection.from_aggregate_map(
            aggregate_fs_map=self
        )

    def get_resource_sync_state(
        self, resource_id: ResourceId
    ) -> AggregateFSResourceMapSyncState:
        """Get sync status for a given resource between the local and remote map."""
        if resource_id in self.local_map and resource_id in self.remote_map:
            local_resource = self.local_map[resource_id]
            remote_resource = self.remote_map[resource_id]
            return AggregateFSResourceMapSyncState.from_resource_maps(
                local_resource_map=local_resource, remote_resource_map=remote_resource
            )

        error_message = (
            f"ResourceID: {resource_id}, does not exist in local_map or remote_map.\n"
            f"{self.local_map.keys()=}\n"
            f"{self.remote_map.keys()=}"
        )
        raise AggregateFSMapResourceMembershipError(error_message)

    # helper methods
    def _map_fn(self, fn, *args, **kwargs) -> Tuple[T]:
        """Map a function call over the LocalFSMap and RemoteFSMap. Results returned in that order."""
        res = []
        for o in [self.local_map, self.remote_map]:
            # append result
            res.append(fn(o, *args, **kwargs))

        # cast to tuple for in adherence with standard pythonic practices
        return tuple(res)
