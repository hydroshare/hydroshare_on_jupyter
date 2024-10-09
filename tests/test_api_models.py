import pytest
import pydantic
from hydroshare_on_jupyter.models import api_models as m


@pytest.fixture
def resource_metadata():
    return m.ResourceMetadata(
        resource_type="resource",
        resource_title="title",
        resource_id="42",
        immutable=True,
        resource_url="www.fake.org",
        date_created="2021-01-01",
        date_last_updated="2021-01-02",
        creator="some creator",
        authors=["some author"],
    )


def test_collection_of_resource_metadata(resource_metadata):
    metadata = resource_metadata
    metadata_dict = metadata.model_dump()

    assert m.CollectionOfResourceMetadata.model_validate([metadata, metadata, metadata])
    assert m.CollectionOfResourceMetadata.model_validate([metadata])
    # test as dictionaries
    assert m.CollectionOfResourceMetadata.model_validate(
        [metadata_dict, metadata_dict, metadata_dict]
    )
    assert m.CollectionOfResourceMetadata.model_validate([metadata_dict])


def test_collection_of_resource_metadata_raises(resource_metadata):
    metadata = resource_metadata

    metadata_subset = {
        "resource_type": "resource",
        "resource_title": "title",
    }

    with pytest.raises(pydantic.ValidationError):
        assert m.CollectionOfResourceMetadata.model_validate([metadata, metadata_subset])


def test_resource_files_should_pass():
    data = {"files": ["/data", "/data/contents", ""]}
    m.ResourceFiles(**data)


RESOURCE_FILES_SHOULD_FAIL_CASES = [
    (["~"]),
    (""),
    (["../"]),
    (["/fake/file/../../"]),
    (["/something~"]),
]


@pytest.mark.parametrize("test_data", RESOURCE_FILES_SHOULD_FAIL_CASES)
def test_resource_files_should_fail(test_data):
    data = {"files": test_data}
    with pytest.raises(pydantic.ValidationError):
        m.ResourceFiles(**data)
