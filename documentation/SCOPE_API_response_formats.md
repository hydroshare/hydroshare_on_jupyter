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

#/resources/<resource_id>/hs-files
GETs list of files that are in a user's HS instance of a resource with the given resource_id ({'files':res})
Example output:
```
{"files": [{"name": "README", "sizeBytes": 16, "type": "md"}, {"name": "Introduction_to_Coding1", "sizeBytes": 545, "type": "ipynb"}, {"name": "Second_File", "sizeBytes": 658, "type": "ipynb"}, {"name": "Introduction_to_Coding", "sizeBytes": 11440, "type": "ipynb"}, {"name": "README", "sizeBytes": 199, "type": "file"}, {"name": "Test", "sizeBytes": 549020, "type": "folder", "contents": [{"name": "terrible_name", "sizeBytes": 10877, "type": "png"}, {"name": "10-SingleCycleCPU_1", "sizeBytes": 538143, "type": "pdf"}]}]}
```

#/resources/<resource_id>/local-files
GETs list of files that are in a user's JH isntance of a resource with the give resource_id ({'files':res})
Example output:

```
{"files": [{"name": "Introduction_to_Coding", "sizeBytes": 11440, "type": "ipynb"}, {"name": "Test", "sizeBytes": 549020, "type": "folder", "contents": [{"name": "terrible_name", "sizeBytes": 10877, "type": "png"}, {"name": "10-SingleCycleCPU_1", "sizeBytes": 538143, "type": "pdf"}]}, {"name": "Introduction_to_Coding1", "sizeBytes": 545, "type": "ipynb"}, {"name": "README", "sizeBytes": 199, "type": "file"}, {"name": "README", "sizeBytes": 16, "type": "md"}, {"name": "Second_File", "sizeBytes": 658, "type": "ipynb"}]}
```
