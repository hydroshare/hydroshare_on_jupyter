# Syncing Data Between HydroShare and Jupyter

This graphical tool allows you to sync HydroShare resource files between HydroShare and your computer. It can be run
on its own or as a Jupyter notebook extension.

## Setup Instructions

The frontend is a React app, and it requires you have [Node](https://nodejs.org/en/download/) and a Node package manager
(we recommend [Yarn](https://classic.yarnpkg.com/en/docs/install/)) installed. Please ensure that is the case and then
 run the following in a terminal:

 ```bash
$ cd webapp
$ yarn install
$ yarn build
```

Once that is complete, please refer to [backend/README.md](https://github.com/kylecombes/hydroshare_jupyter_sync/tree/master/backend).

## Testing Style Guide Enforcement

To run tests to make sure the code is pep8 compliant, you should first install flake8, a tool used for style guide enforcement
with this command:

```bash
$ python<version> -m pip install flake8
```

To run the tests, run the following in a terminal:

```bash
$ cd backend
$ python<version> -m flake8
```

No output confirms that all tests are passing on Python files in the backend directory.
