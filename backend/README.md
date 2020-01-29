# How to use the backend
## Running the server
### Setup
1. Navigate to hydroshare-jupyter-gui/backend/hydroshare_gui
2. If there is a login.py file, make sure the username and password are correct. If not, create one with the lines:

```
username = "your_username"
password = "your_password"
```
3. TODO: Getting local resources

### Actual running

1. Navigate to hydroshare-jupyter-gui/backend/hydroshare_gui
2. Run python3 hs_server.py and open localhost:8080
3. Available things to check (see [here](https://github.com/kylecombes/hydroshare-jupyter-gui/blob/dev/documentation/API_response_formats.md)):
    * localhost:8080/user
    * /resources
    * /resources/<resource_id>/hsfiles
    * /resources/<resource_id>/local-files

## Important files (for code review)
* hs_server.py -- runs the server with get and set functions
* get_info.py -- obtains and formats information for the server (is imported by hs_server.py)