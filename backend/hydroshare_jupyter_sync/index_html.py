from hydroshare_jupyter_sync.config_reader_writer import get_config_values


def get_index_html():
    config = get_config_values(['jupyterNotebookServerPath'])
    server_notebook_dir = ''
    if config:
        server_notebook_dir = config.get('jupyterNotebookServerPath', server_notebook_dir)

    return f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <link rel="shortcut icon" href="/assets/favicon.ico">
    <title>CUAHSI Compute Sync</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script>
      window.SERVER_NOTEBOOK_DIR = "{server_notebook_dir}";
    </script>
    <script type="text/javascript" src="/assets/bundle.js"></script>
  </body>
</html>
"""
