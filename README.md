# HydroShare on Jupyter

HydroShare on Jupyter brings HydroShare resource management to JupyterLab's development environment.
Download, edit, upload, and synchronize your HydroShare resources without leaving Jupyter!
Collaborate, iterate, and stay up to date with HydroShare on Jupyter.

## Installation

In accordance with the python community, we support and advise the usage of virtual environments in
any workflow using python. In the following installation guide, we use python's built-in venv module
to create a virtual environment in which the tools will be installed. Note this is just personal
preference, any python virtual environment manager should work just fine (conda, pipenv, etc. ).


```python
# Create and activate python environment, requires python >= 3.7
python3 -m venv venv
source venv/bin/activate
python3 -m pip install --upgrade pip

# Install
python3 -m pip install hydroshare_on_jupyter

# Link extension to JupyterLab
python3 -m hydroshare_on_jupyter configure

# Launch JupyterLab and start collaborating!
python3 -m jupyter lab
```

## Configuration


HydroShare on Jupyter looks for configuration information in environment variables first, then at
the following path locations:

1. `~/.config/hydroshare_on_jupyter/config`
2. `~/.hydroshare_on_jupyter_config`

The first configuration file found is used if it exists. However, environment variables take
precedence, meaning they override configuration file values if they are set.

HydroShare on Jupyter configuration files use `KEY=VALUE` semantics (example below). Only one
configuration variable should be specified per line. Line comments can be created by starting a line
with `#`.

### Configuration Variables

- `DATA` : directory where HydroShare resources are saved, default `~/hydroshare`.
- `OAUTH` : canonical HydroShare OAuth2 pickle file, default None. Allows bypassing login by using OAuth2 via HydroShare.

Example configuration file

```shell
# file: ~/.config/hydroshare_on_jupyter/config
DATA=~/Downloads
```

**Note**

By default, HydroShare on Jupyter saves HydroShare resources to `~/hydroshare`. This means, if
JupyterLab is started from a directory where `~/hydroshare` is not a descendent (e.g.
`~/Downloads`), you will not be able to open the HydroShare resource files you download using
HydroShare on Jupyter. To resolve this, either open JupyterLab from `~` or change the directory
HydroShare on Jupyter saves resources to using the data `DATA` configuration variable.
