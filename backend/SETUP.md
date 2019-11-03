# Setting up server extension

$ gedit ~/.jupyter/jupyter_notebook_config.py

#c.NotebookApp.nbserver_extensions = {}

becomes

c.NotebookApp.nbserver_extensions = {'backend.hydroshare_gui':True}

sudo python3 setup.py install

JUST KIDDING

make server extension just hydroshare_gui

