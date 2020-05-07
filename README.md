This Jupyter server extension and web app enable easy management of HydroShare resource files in CUAHSI JupyterHub or
on any computer running a Jupyter notebook server. It allows the user to easily open a HydroShare resource,
work on its files in Jupyter, and then sync those changes back to HydroShare using a simple drag-and-drop
interface.

![CUAHSI Jupyter Sync resource list](https://imgur.com/uqvjp5G.png)

![CUAHSI Jupyter Sync resource page](https://imgur.com/plRRvga.png)

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

# Configuration

Your installation can be customized by creating (or editing) a config file in
`~/.config/hydroshare_jupyter_sync/config.json`. Below are all the possible options to specify:

* `archiveMessage`: The message (if any) to display notifying the user of the data retention practices of the system
 they are using (displayed on the resource page under the metadata)
* `dataPath`: The path (relative to the current working directory when `jupyter notebook` is run) where the resource
 data is stored
* `gettingStartedNotebook`: The path (relative to the current working directory in which `jupyter notebook` is run) to
 a getting started notebook. If specified, a message will be shown with a link to this notebook on the resource page.
* `logPath`: The path to the log file in which to save logging output. 

# For Developers

A system diagram of our app is displayed below:

![CUAHSI Jupyter Sync system diagram](https://imgur.com/6NWsxHi.png)

View the `README.md` files in `webapp` and `backend` for more technical details.