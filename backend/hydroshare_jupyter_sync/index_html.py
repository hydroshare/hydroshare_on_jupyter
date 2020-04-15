from hydroshare_jupyter_sync.config_reader_writer import get_config_values

_frontend_url = ''
_backend_api_url = '/syncApi'


def set_frontend_url(url):
    global _frontend_url
    _frontend_url = url


def set_backend_url(url):
    global _backend_api_url
    _backend_api_url = url


def get_index_html():
    global _frontend_url
    global _backend_api_url
    config = get_config_values(['jupyterNotebookServerPath'])
    server_notebook_dir = ''
    if config:
        if config['jupyterNotebookServerPath'] is not None:
            server_notebook_dir = config['jupyterNotebookServerPath']

    return f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="shortcut icon" href="{_frontend_url}/assets/favicon.ico">
    <title>CUAHSI Compute Sync</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script>
      window.SERVER_NOTEBOOK_DIR = "{server_notebook_dir}";
      window.FRONTEND_URL = "{_frontend_url}";
      window.BACKEND_API_URL = "{_backend_api_url}";
    </script>
    <script type="text/javascript" src="{_frontend_url}/assets/bundle.js"></script>
  </body>
</html>
"""
