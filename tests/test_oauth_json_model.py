import pytest
from hydroshare_jupyter_sync.models.oauth import OAuthFile


@pytest.fixture
def testing_data():
    return (
        {
            "access_token": "some_fake_token",
            "token_type": "Bearer",
            "refresh_token": "some_fake_token",
            "scope": "scope",
            "expires_in": 2592000,
        },
        "some_fake_token",
    )


def test_it_works(testing_data):
    o = OAuthFile.parse_obj(testing_data)
    o.dict()[1] == testing_data[1]
