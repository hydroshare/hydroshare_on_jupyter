# Setting up your environment

## Linux/UNIX

Python 3 and pip3 are required to run the server code. If you don't have those for some reason, run the following in a
terminal:

```bash
    $ sudo apt install python3 python3-pip
```

Once you have Python 3 and pip3, we need to install our dependencies and add a line to your `.bashrc` so your
computer always knows where the server files are. To do that, run the following:

```bash
    $ cd backend
    $ pip3 install -r requirements.txt
    $ echo "export PYTHONPATH=$PYTHONPATH:$(pwd)" >> ~/.bashrc
    $ cd ..
    $ echo "export PYTHONPATH=$PYTHONPATH:$(pwd)" >> ~/.bashrc
    $ source ~/.bashrc
```

Now we need to tell the Jupyter notebook server to load our extension. To do that, we need to edit the Jupyter notebook
config file by running

```bash
    $ gedit ~/.jupyter/jupyter_notebook_config.py
```

If that file is empty, that means it hasn't been generated yet. So close it and run

```bash
    $ jupyter notebook --generate-config
```

If the above command fails because it cannot find the command `jupyter`, try running the following to add the directory
containing `jupyter` to your PATH:

```bash
    $ echo "export PATH=$PATH:$HOME/.local/bin" >> ~/.bashrc
    $ source ~/.bashrc
```

Then run `gedit ~/.jupyter/jupyter_notebook_config.py`

Once you have the (non-empty) text file open, go to line 263 (or thereabout) where it
says `c.NotebookApp.nbserver_extensions = {}` (there may or may not already be anything in between the `{}`). In between
the `{}`, add `'backend.hydroshare_jupyter_sync': True`. Assuming it was empty before, it should now look like

```
    c.NotebookApp.nbserver_extensions = {'backend.hydroshare_jupyter_sync': True}
```

Once that is done, save the file (Ctrl+S) and close it.

# Running the server

In a terminal, run

```bash
    $ jupyter notebook
```

The Jupyter notebook server should start, and one of the lines of output should end with

```bash
    Successfully loaded hydroshare_jupyter_sync server extension.
```

Once you see that, go to **[TODO: Insert URL here]**.

# For developers

The file `backend/server.py` can also be run directly using Python (i.e. `$ python server.py`). This is especially
useful if you are using a debugger and want to step through lines of code.

This file is what runs the Tornado web server to handle all of the requests from the web app client. Documentation on
the RESTful API endpoints available can be found
[here](https://github.com/kylecombes/hydroshare-jupyter-gui/blob/dev/documentation/API_response_formats.md).
