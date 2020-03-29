# /
Serves the HTML to load the React web app.

# /user
## GET
Returns the user information on the currently logged in user including name, email, username, etc.

### Sample response

```json
{
    "username": "example",
    "email": "example@email.com",
    "first_name": "First",
    "id": 1234,
    "last_name": "Last",
    "organization": "Cool Place"
}
```

# /resources

## GET
Returns a list of the user's resources on HydroShare.

### Sample response

```json
{
  "resources": [
    {
      "id": "<resource_id>",
      "title": "My Cool Title",
      "hydroShareResource": {
        "resource_type": "CompositeResource",
        "resource_title": "My Cool Title",
        "resource_id": "<resource_id>",
        "abstract": "This is an abstract",
        "authors": [
          "Lastname, Firstname"
        ],
        "creator": "Lastname, Firstname",
        "doi": null,
        "date_created": "01-01-2001",
        "date_last_updated": "01-01-2001",
        "public": false,
        "discoverable": false,
        "shareable": true,
        "coverages": [
          {
            "type": "period",
            "value": {
              "start": "01/01/2000",
              "end": "12/12/2010"
            }
          }
        ],
        "immutable": false,
        "published": false,
        "bag_url": "http://www.hydroshare.org/django_irods/download/bags/<resource_id>.zip?url_download=False&zipped=False&aggregation=False",
        "science_metadata_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/scimeta/",
        "resource_map_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/map/",
        "resource_url": "http://www.hydroshare.org/resource/<resource_id>/"
      }
    },
    {
      "id": "<resource_id>",
      "title": "My Cool Title 2",
      "hydroShareResource": {
        "resource_type": "CompositeResource",
        "resource_title": "My Cool Title 2",
        "resource_id": "<resource_id>",
        "abstract": "This is an abstract",
        "authors": [
          "Lastname, Firstname"
        ],
        "creator": "Lastname, Firstname",
        "doi": null,
        "date_created": "01-01-2001",
        "date_last_updated": "01-01-2001",
        "public": false,
        "discoverable": false,
        "shareable": true,
        "coverages": [
          {
            "type": "period",
            "value": {
              "start": "01/01/2000",
              "end": "12/12/2010"
            }
          }
        ],
        "immutable": false,
        "published": false,
        "bag_url": "http://www.hydroshare.org/django_irods/download/bags/<resource_id>.zip?url_download=False&zipped=False&aggregation=False",
        "science_metadata_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/scimeta/",
        "resource_map_url": "http://www.hydroshare.org/hsapi/resource/<resource_id>/map/",
        "resource_url": "http://www.hydroshare.org/resource/<resource_id>/"
      }
    }
  ]
}
```

## POST
Create a new empty resource in HydroShare.

### Payload
```json
{"title": "title_of_new_resource"}
```

### Sample response

**TODO: Should include the ID of the newly created resource**

## DELETE

Deletes a resource from JupyterHub.

# /resources/<resource_id>/hs-files
## GET
Get a list of files that are in a HydroShare resource.

### Sample response
```json
{
  "files": [
    {
      "name": "README",
      "sizeBytes": 16,
      "type": "md"
    },
    {
      "name": "Introduction_to_Coding1",
      "sizeBytes": 545,
      "type": "ipynb"
    },
    {
      "name": "Second_File",
      "sizeBytes": 658,
      "type": "ipynb"
    },
    {
      "name": "Introduction_to_Coding",
      "sizeBytes": 11440,
      "type": "ipynb"
    },
    {
      "name": "README",
      "sizeBytes": 199,
      "type": "file"
    },
    {
      "name": "Test",
      "sizeBytes": 549020,
      "type": "folder",
      "contents": [
        {
          "name": "terrible_name",
          "sizeBytes": 10877,
          "type": "png"
        },
        {
          "name": "10-SingleCycleCPU_1",
          "sizeBytes": 538143,
          "type": "pdf"
        }
      ]
    }
  ]
}
```

## DELETE
Delete a file from a HydroShare resource.

### Request format
```json
{"filepath": "filepath_to_file_to_delete"}
```

# /resources/<resource_id>/file-ops

## PATCH

This endpoint can be used to both move and copy files between HydroShare and the local filesystem and within them (i.e. the source and destination are both on the same filesystem).

### Request format

**Note:** `prefix` should be replaced with `hs` if the path is on HydroShare or `local` if the path is on the local filesystem.

```json
{
  "operations": [
    {
      "method": "move" | "copy",
      "source": "prefix:/Path/to/file.txt",
      "destination": "prefix:/New/directory" | "prefix:/Path/to/My_new_file.txt",
      "force": true | false,
    }
  ]
}

```

This endpoint can be used to move or copy a file with the same name (by specifying a directory with `destination`) or a different name (by specifying the name in `destination`).

The `force` flag will cause files that already exist to be overwritten.

If `method: move` is specified, the original file will no longer exist if the operation completes successfully.

### Response format

The response will detail which operations were successful and which failed.

Sample response:
```json
{
  "successCount": 1,
  "failureCount": 1,
  "results": [
    {
      "success": true,
    },
    {
      "success": false,
      "error": "FileExists",
      "message": "The file \"My beautiful data.csv\" already exists in \"My data\"."
    }
  ]
}

```

The order of the items in `results` will correspond to the order in which the files were listed in the request.



# /resources/<resource_id>/local-files

## GET
Returns a list of files that are in the local (or JupyterHub) copy of a resource.

### Sample Response
Example output:

```json
{
  "files": [
    {
      "name": "Introduction_to_Coding",
      "sizeBytes": 11440,
      "type": "ipynb"
    },
    {
      "name": "Test",
      "sizeBytes": 549020,
      "type": "folder",
      "contents": [
        {
          "name": "terrible_name",
          "sizeBytes": 10877,
          "type": "png"
        },
        {
          "name": "10-SingleCycleCPU_1",
          "sizeBytes": 538143,
          "type": "pdf"
        }
      ]
    },
    {
      "name": "Introduction_to_Coding1",
      "sizeBytes": 545,
      "type": "ipynb"
    },
    {
      "name": "README",
      "sizeBytes": 199,
      "type": "file"
    },
    {
      "name": "README",
      "sizeBytes": 16,
      "type": "md"
    },
    {
      "name": "Second_File",
      "sizeBytes": 658,
      "type": "ipynb"
    }
  ]
}
```

## DELETE
Deletes the local (JupyterHub) copy of a file in a resource.

### Request Format

```json
{
  "filepath": "filepath_to_file_to_delete"
}
```

## PUT

Creates a new file in a resource on the local filesystem (JupyterHub). The file needs to be manually synced to HydroShare.

### Request Format

```json
{
  "request_type": "new_file",
  "new_filename": "name_of_new_file.filetype"
}
```
