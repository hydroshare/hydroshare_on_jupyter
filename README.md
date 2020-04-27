# Installation


Install the Sync package 

```
$ cd hydroshare_jupyter_sync
$ python setup.py install
```

Activate the server extension

```
jupyter serverextension enable --py hydroshare_jupyter_sync --sys-prefix
```

Launch the Jupyter server

```
jupyter notebook
```

Navigate to the Sync url

```
http://localhost:8888/sync
```


# For developers

The file `backend/server.py` can also be run directly using Python (i.e. `$ python server.py`). This is especially
useful if you are using a debugger and want to step through lines of code.

This file is what runs the Tornado web server to handle all of the requests from the web app client. Documentation on
the RESTful API endpoints available can be found
[here](https://github.com/kylecombes/hydroshare-jupyter-gui/blob/dev/documentation/API_response_formats.md).
