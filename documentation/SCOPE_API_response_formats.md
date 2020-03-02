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
Payload:
```
{"title": "title_of_new_resource"}
```

# /resources/<resource_id>/hs-files
GETs list of files that are in a user's HS instance of a resource with the given resource_id ({'files':res})  
Example output:
```
{"files": [{"name": "/", "sizeBytes": 561878, "modifiedTime": "2020-02-21 06:54:41", "type": "folder", "contents": [{"name": "Introduction_to_Coding", "path": "/Introduction_to_Coding.ipynb", "sizeBytes": 11440, "modifiedTime": "2020-02-21 06:54:40", "type": "ipynb"}, {"name": "README", "path": "/README", "sizeBytes": 199, "modifiedTime": "2020-02-21 06:54:40", "type": "file"}, {"name": "Second_File", "path": "/Second_File.ipynb", "sizeBytes": 658, "modifiedTime": "2020-02-21 06:54:41", "type": "ipynb"}, {"name": "Introduction_to_Coding1", "path": "/Introduction_to_Coding1.ipynb", "sizeBytes": 545, "modifiedTime": "2020-02-21 06:54:40", "type": "ipynb"}, {"name": "README", "path": "/README.md", "sizeBytes": 16, "modifiedTime": "2020-02-21 06:54:41", "type": "md"}, {"name": "Test", "path": "/Test", "sizeBytes": 549020, "modifiedTime": "2020-02-21 06:54:39", "type": "folder", "contents": [{"name": "terrible_name", "path": "/Test/terrible_name.png", "sizeBytes": 10877, "modifiedTime": "2020-02-21 06:54:39", "type": "png"}, {"name": "10-SingleCycleCPU_1", "path": "/Test/10-SingleCycleCPU_1.pdf", "sizeBytes": 538143, "modifiedTime": "2020-02-21 06:54:39", "type": "pdf"}]}]}]}
```

DELETEs file from Hydroshare  
Frontend payload:
```
{"filepath": "filepath_to_file_to_delete"}
```

PUTs either renames/moves a file or overwrites JH file with HS one  
Frontend payload for renaming or moving:
```
{"request_type": "rename_or_move_file",
"old_filepath": "filepath_to_file_to_rename_or_move",
"new_filepath": "new_filepath"}
```

Frontend payload for syncing HS file to JH:  
```
{"request_type": "overwrite_JH",
"filepath": "file_path_to_file_to_sync"}
```

# /resources/<resource_id>/local-files
GETs list of files that are in a user's JH isntance of a resource with the give resource_id ({'files':res})  
Example output:

```
{"files": [{"name": "/", "sizeBytes": 4096, "modifiedTime": "2020-02-19 15:14:56.432693", "type": "folder", "contents": [{"name": "Introduction_to_Coding", "sizeBytes": 11440, "modifiedTime": "2020-02-10 09:46:55.117488", "type": "ipynb"}, {"name": "Test", "sizeBytes": 4096, "modifiedTime": "2020-02-26 08:45:39.975201", "type": "folder", "contents": [{"name": "better_name", "sizeBytes": 10877, "modifiedTime": "2020-02-10 09:46:55.117488", "type": "png"}, {"name": "10-SingleCycleCPU_1", "sizeBytes": 538143, "modifiedTime": "2020-02-10 09:46:55.113488", "type": "pdf"}]}, {"name": "Introduction_to_Coding1", "sizeBytes": 545, "modifiedTime": "2020-02-10 09:46:55.117488", "type": "ipynb"}, {"name": "README", "sizeBytes": 199, "modifiedTime": "2020-02-10 09:46:55.121488", "type": "file"}, {"name": "README", "sizeBytes": 16, "modifiedTime": "2020-02-10 09:46:55.121488", "type": "md"}, {"name": "Second_File", "sizeBytes": 658, "modifiedTime": "2020-02-10 09:46:55.121488", "type": "ipynb"}]}]}
```

DELETEs file from JupyterHub  
Frontend payload:
```
{"filepath": "filepath_to_file_to_delete"}
```

PUTs overwrites JH file with HS one, renames/moves a file, or creates a new one  
Frontend payload for syncing HS file to JH:
```
{"request_type": "overwrite_HS",
"filepath": "file_path_to_file_to_sync"}
```
Frontend payload for renaming/moving:
```
{"request_type": "rename_or_move_file",
"old_filepath": "filepath_to_file",
"new_filepath": "filepath_to_new_location_or_new_name"}
```
Frontend payload for creating a new file in JH:
```
{"request_type": "new_file",
"new_filename":"name_of_new_file.filetype"}
```
