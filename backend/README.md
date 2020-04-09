[//]: # (TODO: update this file - potentially make is describe the backend)

# How to use the backend
## Running the server
### Setup
1. Navigate to hydroshare-jupyter-gui/backend/hydroshare_jupyter_sync_pkg
2. If there is a login.py file, make sure the username and password are correct. If not, create one with the lines:

```
username = "your_username"
password = "your_password"
```
3. TODO: Getting local resources

### Actual running

1. Navigate to hydroshare-jupyter-gui/backend/hydroshare_jupyter_sync_pkg
2. Run `python3 hs_server.py` and open localhost:8080
3. To run the server with logging output, specify the level of output when you
run the file. For example, `python3 hs_server.py info`. The options for logging
output level are debug, info, warning, error, or critical.
4. Available things to check (see [here](https://github.com/kylecombes/hydroshare-jupyter-gui/blob/dev/documentation/API_response_formats.md))

## Important files (for code review)
* hs_server.py -- runs the server with get and set functions
* get_info.py -- obtains and formats information for the server (is imported by hs_server.py)
