import pytest
from hydroshare_on_jupyter.models.oauth import OAuthFile


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
    o = OAuthFile.model_validate(testing_data)
    assert o.model_dump()[1] == testing_data[1]
