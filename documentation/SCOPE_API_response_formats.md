# /user
GETs user information on the currently logged in user including name, email, username, etc.
Example output:

```
{
    "username": "example",
    "email": "example@email.com",
    "first_name": "First",
    "id": 1234,
    "last_name": "Last",
    "organization": "Cool Place"}
```

# /resources
GETs list of user resources on HydroShare ({'resources':resources})
Example output:

```
{
    "resources": [  
                    {
                    "id": "<resource_id>",
                    "title": "My Cool Title",
                    "hydroShareResource":   {
                                            "resource_type": "CompositeResource",
                                            "resource_title": "My Cool Title",
                                            "resource_id": "<resource_id>",
                                            "abstract": "This is an abstract",
                                            "authors": ["Lastname, Firstname"],
                                            "creator": "Lastname, Firstname",
                                            "doi": null,
                                            "date_created": "01-01-2001",
                                            "date_last_updated": "01-01-2001",
                                            "public": false,
                                            "discoverable": false,
                                            "shareable": true,
                                            "coverages":[
                                                            {
                                                            "type": "period",
                                                            "value":{
                                                                        "start": "01/01/2000",
                                                                        "end": "12/12/2010"
                                                                    }
                                                            }
                                                        ],
                                            "immutable": false,
                                            "published": false,
                                            "bag_url": "http://www.hydroshare.org/django_irods/download/bags/<resource_id>.zip?url_download=False&zipped=False&aggregation=False",
                                            "science_metadata_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/scimeta/",
                                            "resource_map_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/map/", "resource_url": "http://www.hydroshare.org/resource/<resource_id>/"
                                            }
                    },
                    {
                    "id": "<resource_id>",
                    "title": "My Cool Title 2",
                    "hydroShareResource":   {
                                            "resource_type": "CompositeResource",
                                            "resource_title": "My Cool Title 2",
                                            "resource_id": "<resource_id>",
                                            "abstract": "This is an abstract",
                                            "authors": ["Lastname, Firstname"],
                                            "creator": "Lastname, Firstname",
                                            "doi": null,
                                            "date_created": "01-01-2001",
                                            "date_last_updated": "01-01-2001",
                                            "public": false,
                                            "discoverable": false,
                                            "shareable": true,
                                            "coverages":[
                                                            {
                                                            "type": "period",
                                                            "value":{
                                                                        "start": "01/01/2000",
                                                                        "end": "12/12/2010"
                                                                    }
                                                            }
                                                        ],
                                            "immutable": false,
                                            "published": false,
                                            "bag_url": "http://www.hydroshare.org/django_irods/download/bags/<resource_id>.zip?url_download=False&zipped=False&aggregation=False",
                                            "science_metadata_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/scimeta/",
                                            "resource_map_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/map/", "resource_url": "http://www.hydroshare.org/resource/<resource_id>/"
                                            }
                    }
                ]
}
```

#/resources/<resource_id>/hsfiles
GETs list of files that are in a user's HS instance of a resource with the given resource_id ({'files':res})
Example output:
[//]: # (TODO (vicky): we should add the example output now that this one is working properly)

#/resources/<resource_id>/local-files
GETs list of files that are in a user's JH isntance of a resource with the give resource_id ({'files':res})
Example output:
[//]: # (TODO (vicky): does dirpath actually show that whole thing? I thought it only showed the path beyond contents.. which one do we want frontend people?)

```
{
    "files": [
                {
                    "dirPath": "backend/tests/hs_resources/<resource_id>/<resource_id>/data/contents",
                    "name": "Index",
                    "sizeBytes": 20365,
                    "type": "ipynb"
                },
                {
                    "dirPath": "backend/tests/hs_resources/<resource_id>/<resource_id>/data/contents",
                    "name": "README",
                    "sizeBytes": 0,
                    "type": "md"}
            ]
}
```
