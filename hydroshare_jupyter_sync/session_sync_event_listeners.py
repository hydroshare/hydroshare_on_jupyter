from dataclasses import dataclass

# local imports
from .fs_events import Events
from .session_struct_interface import ISessionSyncStruct


@dataclass
class SessionSyncEventListeners(ISessionSyncStruct):
    """Shim that encapsulates session sync struct event listener logic."""

    def setup_event_listeners(self):
        # event listeners
        listeners = [
            (Events.RESOURCE_DOWNLOADED, self.resource_downloaded),
            (Events.RESOURCE_ENTITY_DOWNLOADED, self.resource_entity_downloaded),
            (Events.RESOURCE_ENTITY_UPLOADED, self.resource_uploaded),
        ]
        for event, listener in listeners:
            self.event_broker.subscribe(event, listener)

    def resource_uploaded(self, resource_id) -> None:
        # pull updated md5 checksums from HydroShare
        self.aggregate_fs_map.remote_map.update_resource(resource_id)

    def resource_downloaded(self, resource_id) -> None:
        # if resource already in agg map, just update resource in local map
        if resource_id in self.aggregate_fs_map.local_map:
            self.aggregate_fs_map.local_map.update_resource(resource_id)

        else:
            self._add_resource_to_agg_map_and_create_watcher(resource_id)

    def resource_entity_downloaded(self, resource_id) -> None:
        # if resource already in agg map, add resource file
        if resource_id in self.aggregate_fs_map.local_map:
            self.aggregate_fs_map.add_resource_file(resource_id)

        else:
            self._add_resource_to_agg_map_and_create_watcher(resource_id)

    def _add_resource_to_agg_map_and_create_watcher(self, resource_id):
        self.aggregate_fs_map.add_resource(resource_id)

        if resource_id not in self.fs_observers:
            # get local resource object
            res = self.aggregate_fs_map.local_map[resource_id]

            # create a resource specific event handler
            event_handler = self.event_handler_factory(res)

            # bind handler to observer
            watcher = self.observer.schedule(
                event_handler, res.data_path, recursive=True
            )

            self.fs_observers[resource_id] = watcher
