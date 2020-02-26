# Hydroshare Jupyter GUI Server Extension

## Setup Instructions

1. From the backend folder run the following commands:

`pip install -r requirements.txt`

`sudo python setup.py install`


2. Install Node and then run the following commands from the webapp folder:

`yarn install`

`yarn build`


3. Install Jupyter and generate a config file by running this command:

`jupyter notebook --generate-config`


4. Modify the Jupyter config file:

`sudo gedit ~/.jupyter/jupyter_notebook_config.py`

Find the line that starts with: `c.NotebookApp.nbserver_extensions =`.
Uncomment that line and change it to read as follows:

`c.NotebookApp.nbserver_extensions = {'backend.hydroshare_gui': True}`.


5. Add the backend folder of this repository to your PYTHONPATH:

`sudo gedit ~/.bashrc`

Add the following line (modify the path to be the path to this folder/backend):

`export PYTHONPATH="${PYTHONPATH}:/home/username/hydroshare-jupyter-gui/backend"`

Double check that your path has been properly added to by running:

`echo $PYTHONPATH`

and confirming that you see the path to the backend folder.


6. Run `jupyter notebook` in the main hydroshare-jupyter-gui folder to launch
the jupyter server extension. And navigate to localhost:8080 at your browser
to view the webpage.
