import pytest
import pydantic
from hydroshare_jupyter_sync.models import api_models as m


def test_collection_of_resource_metadata():
    metadata = m.ResourceMetadata(
        resource_type="resource",
        resource_title="title",
        resource_id="42",
        immutable=True,
        resource_url="www.fake.org",
    )
    metadata_dict = metadata.dict()

    assert m.CollectionOfResourceMetadata.parse_obj([metadata, metadata, metadata])
    assert m.CollectionOfResourceMetadata.parse_obj([metadata])
    # test as dictionaries
    assert m.CollectionOfResourceMetadata.parse_obj(
        [metadata_dict, metadata_dict, metadata_dict]
    )
    assert m.CollectionOfResourceMetadata.parse_obj([metadata_dict])


def test_collection_of_resource_metadata_raises():
    metadata = m.ResourceMetadata(
        resource_type="resource",
        resource_title="title",
        resource_id="42",
        immutable=True,
        resource_url="www.fake.org",
    )

    metadata_subset = {
        "resource_type": "resource",
        "resource_title": "title",
    }

    with pytest.raises(pydantic.error_wrappers.ValidationError):
        assert m.CollectionOfResourceMetadata.parse_obj([metadata, metadata_subset])
