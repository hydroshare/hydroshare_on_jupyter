"""
This file reads from and writes to a global config file that includes data
such as user credentials, logging file path, etc.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
import json
import logging
from pathlib import Path

config_path = (Path.home() / '.config' / 'hydroshare_jupyter_sync'
               / 'config.json')


def get_config_values(keys):
    """ Gets config values for the variables in keys.

        :param keys: list of keys you want to look up in config file
        :type keys: list
        :return: dictionary of keys mapping to their values from config
    """
    if config_path.is_file():
        try:
            # Read from the file
            with open(str(config_path), 'r') as f:
                try:
                    config = json.load(f)
                    res = {}
                    for k in keys:
                        if k in config:
                            res[k] = config[k]
                    return res
                except json.JSONDecodeError:
                    logging.error('Could not decode ' + str(config_path))
                    return None
        except IOError:
            logging.error('Found existing config file in ' + str(config_path) +
                          ' but could not open it.')
            return None
    else:
        logging.info('Could not locate config file at ' + str(config_path))
        return None


def set_config_values(d):
    """ Sets config values for the key, value pairs in d.

        :param d: dictionary of key value pairs to store in config file
        :type d: dict
        :return: True if write is successful and False otherwise
    """
    config_exists = config_path.exists()
    if not config_exists:
        # Create the parent directory if it doesn't exist
        if not config_path.parent.exists():
            config_path.parent.mkdir(parents=True)
    elif not config_path.is_file():  # A folder perhaps?
        logging.error(str(config_path) + ' exists but is not a file.')
        return False

    mode = 'r+' if config_exists else 'w+'
    try:
        with open(str(config_path), mode) as f:
            if config_exists:
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
