[//]: # (SPIFFY (Vicky) Forgot this file existed.. is this the right place for it?)

# Setting up server extension

$ gedit ~/.jupyter/jupyter_notebook_config.py

#c.NotebookApp.nbserver_extensions = {}

becomes

c.NotebookApp.nbserver_extensions = {'backend.hydroshare_gui': True}

go to backend folder
sudo python3 setup.py install

go back to hydroshare-jupyter-gui and run jupyter notebook

attempted:
- try installing without sudo
- jupyter notebookin hydroshare-jupyter-gui
- commenting out the c.NotebookApp line thing
- jupyter serverextension enable --py backend
- {'backend':True, 'hydroshare_gui':True}
- changing setup.py tool
- making sure jupyter notebook in python3
- pip3 install jupyter_contrib_nbextensions && jupyter contrib nbextensions install


warning: unknown distribution option
