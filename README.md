This Jupyter server extension and web app enable easy management of HydroShare resource files in CUAHSI JupyterHub or
on any computer running a Jupyter notebook server. It allows the user to easily open a HydroShare resource,
work on its files in Jupyter, and then sync those changes back to HydroShare using a simple drag-and-drop
interface.

![CUAHSI Jupyter Sync resource list](https://imgur.com/uqvjp5G.png)

![CUAHSI Jupyter Sync resource page](https://imgur.com/v5tbB9X.png)


# Installation

To install latest release of the app, run the following: 

```bash
$ cd hydroshare_jupyter_sync
$ pip install hydroshare_jupyter_sync
```

Then activate the server extension using

```
jupyter serverextension enable --py hydroshare_jupyter_sync --sys-prefix
```

Lastly, launch your Jupyter server from your home directory:

```
jupyter notebook
```

and navigate to the CUAHSI Jupyter Sync URL:

```
http://localhost:8888/sync
```
Choose custom directory to provide your custom path where you want to store HydroShare data or 
choose default directory to store HydroShare data in your home folder

![CUAHSI Jupyter Sync path selector](https://imgur.com/0UeTkyY.png)
# Configuration

Your installation can be customized by creating (or editing) a config file in
`~/.config/hydroshare_jupyter_sync/config.json`. Below are all the possible options to specify:

* `dataPath`: The path (asked with the Path Selector dialog during the initialization of app) where the resource
 data is stored

* `logPath`: The path to the log file in which to save logging output. 

# For Developers

A system diagram of our app is displayed below:

![CUAHSI Jupyter Sync system diagram](https://imgur.com/6NWsxHi.png)

View the `README.md` files in `webapp` and `backend` for more technical details.