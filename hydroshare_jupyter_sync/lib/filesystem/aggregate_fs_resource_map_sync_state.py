from __future__ import annotations
from pydantic import BaseModel
from pathlib import Path
from typing import Set, List, TYPE_CHECKING
from .fs_resource_map import LocalFSResourceMap, RemoteFSResourceMap

# Avoid cyclic import
if TYPE_CHECKING:
    from .aggregate_fs_map import AggregateFSMap


class AggregateFSResourceMapSyncState(BaseModel):
    """Data structure that describes the filesystem sync state between a local and
    remote FSResourceMap i.e. file exists locally, not remotely and vice versa. Or,
    local and remote file md5 checksums do not agree.

    Notes:
        only_local => local - (local n remote)
                    so: local - remote
        only_remote => remote - (local n remote)
        out_of_sync => ( (set(local.value) u set(remote.value)) - (set(local.value) n set(remote.value)) ) | (local n remote)
                    symmetric difference
    """

    resource_id: str
    only_local: Set[Path]
    only_remote: Set[Path]
    out_of_sync: Set[Path]
    in_sync: Set[Path]

    @classmethod
    def from_resource_maps(
        cls,
        *,
        local_resource_map: LocalFSResourceMap,
        remote_resource_map: RemoteFSResourceMap
    ) -> "AggregateFSResourceMapSyncState":
        # verify local and remote instances track the same resource
        assert local_resource_map.resource_id == remote_resource_map.resource_id
        resource_id = local_resource_map.resource_id

        local = set(local_resource_map.keys())
        remote = set(remote_resource_map.keys())

        only_local = local - remote
        only_remote = remote - local

        intersection = local & remote
        out_of_sync = {
            item
            for item in intersection
            if local_resource_map[item] != remote_resource_map[item]
        }
        in_sync = intersection - out_of_sync

        return cls(
            resource_id=resource_id,
            in_sync=in_sync,
            out_of_sync=out_of_sync,
            only_local=only_local,
            only_remote=only_remote,
        )


class AggregateFSResourceMapSyncStateCollection(BaseModel):
    __root__: List[AggregateFSResourceMapSyncState]

    @classmethod
    def from_aggregate_map(
        cls, *, aggregate_fs_map: AggregateFSMap
    ) -> "AggregateFSResourceMapSyncStateCollection":
        lm = aggregate_fs_map.local_map
        rm = aggregate_fs_map.remote_map

        res_intersection = set(lm) & set(rm)

        return cls.parse_obj(
            [
                AggregateFSResourceMapSyncState.from_resource_maps(
                    local_resource_map=lm[res_id], remote_resource_map=rm[res_id]
                )
                for res_id in res_intersection
            ]
        )
