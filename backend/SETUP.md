# Setting up server extension

$ gedit ~/.jupyter/jupyter_notebook_config.py

#c.NotebookApp.nbserver_extensions = {}

becomes

c.NotebookApp.nbserver_extensions = {'backend.hydroshare_gui': True}

go to backend folder
sudo python3 setup.py install

attempted:
- try installing without sudo
- jupyter notebookin hydroshare-jupyter-gui
- commenting out the c.NotebookApp line thing
- jupyter serverextension enable --py backend
- {'backend':True, 'hydroshare_gui':True}



warning: unknown distribution option