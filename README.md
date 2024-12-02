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

python -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip

# Install
python -m pip install hydroshare_on_jupyter

# Link extension to JupyterLab
python -m hydroshare_on_jupyter configure

# Launch JupyterLab and start collaborating!
python -m jupyter lab
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

## Development

HydroShare on Jupyter is open source and is available on [GitHub](https://github.com/hydroshare/hydroshare_on_jupyter).
For contributing, please follow the following steps:

1. Clone the repository: `git clone https://github.com/hydroshare/hydroshare_on_jupyter.git`
2. Create a branch: `git checkout -b my-branch`
3. Create and activate a virtual environment (python >= 3.7): `python -m venv venv`
4. Activate the virtual environment: `source venv/bin/activate`
5. Build the frontend: Refer to webapp/README.md for instructions.   
6. Build the backend:

    6.1. Navigate to the root of the project: `hydroshare_on_jupyter`

    6.2. Run: `python pip install -e .`
7. Link extension to JupyterLab: `python -m hydroshare_on_jupyter configure` 
8. Check the list of configured extensions: `jupyter labextension list --verbose`

   8.1.  Make sure the HydroShare on Jupyter extension is listed
9. Check the list of server extensions: `jupyter server extension list`

   9.1. Make sure the HydroShare on Jupyter server extension is listed
10. Set up the DATA environment variable: `export DATA=~/hydroshare/Downloads`
11. Launch JupyterLab: `python -m jupyter lab --debug --notebook-dir=~/hydroshare`
12. You should see the HydroShare on Jupyter extension in the JupyterLab launcher. Double click to open HydroShare on Jupyter.
13. Commit and push your changes.
14. Create a pull request GitHub.

