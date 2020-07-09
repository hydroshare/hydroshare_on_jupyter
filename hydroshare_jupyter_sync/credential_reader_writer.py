"""
This file reads from and writes to a global config file that includes data
such as user credentials, logging file path, etc.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
import json
import logging
from pathlib import Path

credential_path = (Path.home() / 'hydroshare'/ 'credentials_data.dat')

def get_credential_values(keys):
    """ Gets config values for the variables in keys.

        :param keys: list of keys you want to look up in config file
        :type keys: list
        :return: dictionary of keys mapping to their values from config
    """
    if credential_path.is_file():
        try:
            # Read from the file
            with open(str(credential_path), 'r') as f:
                try:
                    config = json.load(f)
                    res = {}
                    for k in keys:
                        if k in config:
                            res[k] = config[k]
                    return res
                except json.JSONDecodeError:
                    logging.error('Could not decode ' + str(credential_path))
                    return None
        except IOError:
            logging.error('Found existing config file in ' + str(credential_path) +
                          ' but could not open it.')
            return None
    else:
        logging.info('Could not locate config file at ' + str(credential_path))
        return None


def set_credential_values(d):
    """ Sets config values for the key, value pairs in d.

        :param d: dictionary of key value pairs to store in config file
        :type d: dict
        :return: True if write is successful and False otherwise
    """
    credentials_exists = credential_path.exists()
    if not credentials_exists:
        # Create the parent directory if it doesn't exist
        if not credential_path.parent.exists():
            credential_path.parent.mkdir(parents=True)
    elif not credential_path.is_file():  # A folder perhaps?
        logging.error(str(credential_path) + ' exists but is not a file.')
        return False

    mode = 'r+' if credentials_exists else 'w+'
    try:
        with open(str(credential_path), mode) as f:
            if credentials_exists:
                try:
                    credentials = json.load(f)
                    f.seek(0)  # Point back to the beginning of the file
                except json.JSONDecodeError as e:
                    logging.error(e)
                    logging.warning('Could not parse config file')
                    credentials = {}
            else:
                credentials = {}
            for k, v in d.items():
                credentials[k] = v
            json.dump(credentials, f)
            return True
    except IOError as e:
        logging.error('Could not write to credentials file ' + str(credential_path))
        logging.error(e)
        return False
