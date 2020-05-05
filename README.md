This Jupyter server extension and web app enable easy management of HydroShare resource files in CUAHSI JupyterHub or
on any computer running a Jupyter notebook server. It allows the user to easily open a HydroShare resource,
work on its files in Jupyter, and then sync those changes back to HydroShare using a simple drag-and-drop
interface.

# Installation

To install latest release of the app, run the following: 

```bash
$ cd hydroshare_jupyter_sync
$ python setup.py install
```

Then activate the server extension using

```
jupyter serverextension enable --py hydroshare_jupyter_sync --sys-prefix
```

Lastly, launch your Jupyter server:

```
jupyter notebook
```

and navigate to the CUAHSI Jupyter Sync URL:

```
http://localhost:8888/sync
```

# For Developers

View the `README.md` files in `webapp` and `backend` for more technical details.