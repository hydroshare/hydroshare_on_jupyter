# /
serves the html for the frontend

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

POSTs to create new empty resource in Hydroshare  
```
Payload: {"title": "title_of_new_resource"}
```

# /resources/<resource_id>/hs-resources
GETs list of files that are in a user's HS instance of a resource with the given resource_id ({'files':res})  
Example output:
```
{"files": [{"name": "README", "sizeBytes": 16, "type": "md"}, {"name": "Introduction_to_Coding1", "sizeBytes": 545, "type": "ipynb"}, {"name": "Second_File", "sizeBytes": 658, "type": "ipynb"}, {"name": "Introduction_to_Coding", "sizeBytes": 11440, "type": "ipynb"}, {"name": "README", "sizeBytes": 199, "type": "file"}, {"name": "Test", "sizeBytes": 549020, "type": "folder", "contents": [{"name": "terrible_name", "sizeBytes": 10877, "type": "png"}, {"name": "10-SingleCycleCPU_1", "sizeBytes": 538143, "type": "pdf"}]}]}
```

# /resources/<resource_id>/hs-files
DELETEs file from Hydroshare  
Frontend payload:
```
{"filepath": "filepath_to_file_to_delete"}
```

PUTs either renames a file or overwrites JH file with HS one  
Frontend payload for renaming:
```
{"request_type": "rename_file",
"filepath": "filepath_to_folder_with_file_to_rename",
"old_filename": "old_file_name",
"new_filename": "new_file_name"}
```

Frontend payload for syncing HS file to JH:
```
{"request_type": "overwrite_JH",
"filepath": "file_path_to_file_to_sync"}
```

# /resources/<resource_id>/local-resources
GETs list of files that are in a user's JH isntance of a resource with the give resource_id ({'files':res})  
Example output:

```
{"files": [{"name": "Introduction_to_Coding", "sizeBytes": 11440, "type": "ipynb"}, {"name": "Test", "sizeBytes": 549020, "type": "folder", "contents": [{"name": "terrible_name", "sizeBytes": 10877, "type": "png"}, {"name": "10-SingleCycleCPU_1", "sizeBytes": 538143, "type": "pdf"}]}, {"name": "Introduction_to_Coding1", "sizeBytes": 545, "type": "ipynb"}, {"name": "README", "sizeBytes": 199, "type": "file"}, {"name": "README", "sizeBytes": 16, "type": "md"}, {"name": "Second_File", "sizeBytes": 658, "type": "ipynb"}]}
```

# /resources/<resource_id>/local-files
DELETEs file from JupyterHub  
Frontend payload:
```
{"filepath": "filepath_to_file_to_delete"}
```

PUTs overwrites JH file with HS one, renames a file, or creates a new one
Frontend payload for syncing HS file to JH:
```
{"request_type": "overwrite_JH",
"filepath": "file_path_to_file_to_sync"}
```
Frontend payload for renaming:
```
{"request_type": "rename_file",
"filepath": "filepath_to_folder_with_file_to_rename",
"old_filename": "old_file_name",
"new_filename": "new_file_name"}
```
Frontend payload for creating a new file in JH:
```
{"request_type": "new_file",
"new_filename":"name_of_new_file.filetype"}
```
