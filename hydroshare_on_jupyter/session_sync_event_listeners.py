from dataclasses import dataclass

# local imports
from .fs_events import Events
from .session_struct_interface import ISessionSyncStruct
from .lib.filesystem.types import ResourceId


@dataclass
class SessionSyncEventListeners(ISessionSyncStruct):
    """Shim that encapsulates session sync struct event listener logic."""

    def setup_event_listeners(self):
        # event listeners
        listeners = [
            (Events.RESOURCE_FILES_LISTED, self.resource_files_listed),
            (Events.RESOURCE_DOWNLOADED, self.resource_downloaded),
            (Events.RESOURCE_ENTITY_DOWNLOADED, self.resource_entity_downloaded),
            (Events.RESOURCE_ENTITY_UPLOADED, self.resource_uploaded),
        ]
        for event, listener in listeners:
            self.event_broker.subscribe(event, listener)

    def resource_files_listed(self, resource_id: ResourceId) -> None:
        # check if in local map (resource would also be in remote map)
        if resource_id in self.aggregate_fs_map.local_map:
            return

        # check naively for local resource files
        naive_local_resource_ids = set(
            self.aggregate_fs_map.local_map._get_resource_ids()
        )
        # if the resource is local, add to aggregate map (compute checksums, add to local map and create
        # fs event listener).
        if resource_id in naive_local_resource_ids:
            self._add_resource_to_agg_map_and_create_watcher(resource_id)

            # emit RESOURCE_STATUS signal
            self.event_broker.dispatch(Events.RESOURCE_STATUS, resource_id)

    def update_remote_resource(self, resource_id: ResourceId) -> None:

        if resource_id in self.aggregate_fs_map.remote_map:
            # pull updated md5 checksums from HydroShare
            self.aggregate_fs_map.remote_map.update_resource(resource_id)

    def resource_uploaded(self, resource_id: ResourceId) -> None:
        # pull updated md5 checksums from HydroShare
        self.aggregate_fs_map.remote_map.update_resource(resource_id)

    def resource_downloaded(self, resource_id: ResourceId) -> None:
        # if resource already in agg map, just update resource in local map
        if resource_id in self.aggregate_fs_map.local_map:
            self.aggregate_fs_map.local_map.update_resource(resource_id)

        else:
            self._add_resource_to_agg_map_and_create_watcher(resource_id)

        # emit RESOURCE_STATUS signal
        self.event_broker.dispatch(Events.RESOURCE_STATUS, resource_id)

    def resource_entity_downloaded(self, resource_id: ResourceId) -> None:
        # if resource already in agg map, add resource file
        if resource_id in self.aggregate_fs_map.local_map:
            # TODO: `add_resource_file` is not method on `AggregateFSMap`. For now, both local and
            # remote resources stored in the `AggregateFSMap` instance are updated. this is
            # computationally burdensome and not necessary, but has desirable guarantees. a proper
            # solution should be implemented in the future.
            self.aggregate_fs_map.update_resource(resource_id)
            # self.aggregate_fs_map.add_resource_file(resource_id)

        else:
            self._add_resource_to_agg_map_and_create_watcher(resource_id)

        # emit RESOURCE_STATUS signal
        self.event_broker.dispatch(Events.RESOURCE_STATUS, resource_id)

    def _add_resource_to_agg_map_and_create_watcher(self, resource_id: ResourceId):
        self.aggregate_fs_map.add_resource(resource_id)

        if resource_id not in self.fs_observers:
            # get local resource object
            res = self.aggregate_fs_map.local_map[resource_id]

            # create a resource specific event handler
            event_handler = self.event_handler_factory(res)

            # bind handler to observer
            watcher = self.observer.schedule(
                event_handler, res.contents_path, recursive=True
            )

            self.fs_observers[resource_id] = watcher
