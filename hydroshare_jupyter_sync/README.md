## CUAHSI Jupyter Sync Backend

If you wish to make changes to the backend, simply edit the Python files in this directory.

Re-launching your Jupyter notebook server should run the latest code.

If you'd like to run in development mode (or attach a debugger), then just run `server.py`.

# API

Below is a summary of the various API endpoints with sample requests and responses.

## /sync
Serves the HTML to load the React web app.

## /syncApi/user
### GET
Returns the user information on the currently logged in user including name, email, username, etc.

#### Sample response

```json
{
    "username": "example",
    "email": "example@email.com",
    "first_name": "First",
    "id": 1234,
    "last_name": "Last",
    "organization": "My Organization"
}
```

## /syncApi/resources

### GET
Returns a list of the user's resources on HydroShare.

#### Sample response

```json
{
  "resources": [
    {
      "id": "abbc38aff2bcc8dd2a",
      "title": "My test resource",
      "hydroShareResource": {
        <hs_restcient response>
      }
    }
  ]
}
```

### POST
Create a new empty resource in HydroShare.

#### Payload
```json
{ "title": "My latest model" }
```

### DELETE

Deletes a resource from JupyterHub.

## /syncApi/resources/<resource_id>/hs-files
### GET
Get a list of files that are in a HydroShare resource.

#### Sample response
```json
{
  "files": [
    {
      "name": "README",
      "sizeBytes": 16,
      "type": "md"
    },
    {
      "name": "Model",
      "sizeBytes": 11440,
      "type": "ipynb"
    },
    {
      "name": "Data",
      "sizeBytes": 549020,
      "type": "folder",
      "contents": [
        {
          "name": "Measurements",
          "sizeBytes": 10877,
          "type": "csv"
        },
        {
          "name": "Samples",
          "sizeBytes": 538143,
          "type": "xlsx"
        }
      ]
    }
  ]
}
```

### DELETE
Delete a file from a HydroShare resource.

#### Request format
```json
{"filepaths": ["filepath_to_file1_to_delete", "filepath_to_file2_to_delete"]}
```

## /syncApi/resources/<resource_id>/file-ops

### PATCH

This endpoint can be used to both move and copy files between HydroShare and the local filesystem and within them (i.e. the source and destination are both on the same filesystem).

#### Request format

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

#### Response format

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



## /syncApi/resources/<resource_id>/local-files

### GET
Returns a list of files that are in the local (or JupyterHub) copy of a resource.

#### Sample Response
Example output:

```json
{
  "files": [
    {
      "name": "README",
      "sizeBytes": 16,
      "type": "md"
    },
    {
      "name": "Model",
      "sizeBytes": 11440,
      "type": "ipynb"
    },
    {
      "name": "Data",
      "sizeBytes": 549020,
      "type": "folder",
      "contents": [
        {
          "name": "Measurements",
          "sizeBytes": 10877,
          "type": "csv"
        },
        {
          "name": "Samples",
          "sizeBytes": 538143,
          "type": "xlsx"
        }
      ]
    }
  ]
}
```

### DELETE
Deletes the local (JupyterHub) copy of a file in a resource.

#### Request Format

```json
{
  "files": ["hs:/README.md", "local:/My-models/Model1.ipynb"]
}
```

### PUT

Creates a new file in a resource on the local filesystem (JupyterHub). The file needs to be manually synced to HydroShare.

#### Request Format

```json
{
  "type": "new_file",
  "name": "name_of_new_file.filetype"
}
```
