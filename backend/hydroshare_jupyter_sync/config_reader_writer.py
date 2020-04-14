import json
import logging
from pathlib import Path

config_path = Path.home() / '.config' / 'hydroshare_jupyter_sync' / 'config.json'


def get_config_values(keys):
    # Attempt to read the config file from ~/.config/hydroshare_jupyter_sync/config.json
    if config_path.is_file():
        try:
            # Read from the file
            with open(str(config_path), 'r') as f:
                try:
                    config = json.load(f)
                    res = {}
                    for k in keys:
                        res[k] = config.get(k)
                    return res
                except json.JSONDecodeError:
                    logging.error('Could not decode ' + str(config_path))
                    return None
        except IOError:
            logging.error('Found existing config file in ' + str(config_path) + ' but could not open it.')
            return None
    else:
        logging.error('Could not locate config file at ' + str(config_path))
        return None


def set_config_values(d):
    if not config_path.exists():
        # Create the parent directory if it doesn't exist
        if not config_path.parent.exists():
            config_path.parent.mkdir(parents=True)
    elif not config_path.is_file():  # A folder perhaps?
        logging.error(str(config_path) + ' exists but is not a file.')
        return False

    try:
        with open(str(config_path), 'r+') as f:
            if f:
                try:
                    config = json.load(f)
                    f.seek(0)  # Point back to the beginning of the file
                except json.JSONDecodeError as e:
                    logging.error(e)
                    logging.warning('Could not parse config file')
                    config = {}
            else:
                config = {}
            for k, v in d.items():
                config[k] = v
            json.dump(config, f)
            return True
    except IOError as e:
        logging.error('Could not write to config file ' + str(config_path))
        logging.error(e)
        return False
