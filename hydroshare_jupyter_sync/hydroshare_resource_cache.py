from hsclient import HydroShare, Resource


class HydroShareWithResourceCache(HydroShare):
    """Extends hsclient.HydroShare to include a dictionary of cached resources"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._resource_dict = dict()

    def resource(self, resource_id: str, validate: bool = True) -> Resource:
        """Add Resource object caching"""
        # Returned if already in cached resources
        if resource_id in self._resource_dict:
            return self._resource_dict[resource_id]

        res = super().resource(resource_id, validate=validate)

        # Put Resource in cache
        self._resource_dict[resource_id] = res
        return res
