from pathlib import Path
import hashlib
from hsclient import Resource

# typing imports
from typing import Dict, Union
from .types import MD5Hash


def get_resource_checksums(resource: Resource) -> Dict[Path, MD5Hash]:
    """Return dictionary of file path: MD5 checksum for a given HydroShare resource. Only files that
    are children of 'data/contents/' are included. All file paths are relative to an unspecified
    root.

    Args:
        resource (Resource): HydroShare Resource object

    Returns:
        Dict[Path, MD5Hash]: relative file path as Path, MD5 checksum
    """
    return {
        Path(k): v
        for k, v in resource._checksums.items()
        if k.startswith("data/contents/")
    }


def compute_file_md5_hexdigest(file: Union[str, Path]) -> str:
    """Compute a file's md5 hexdigest. Read file as chunks to conserve memory usage.

    Args:
        file (Union[str, Path]): path to file

    Returns:
        str: file's md5 checksum as hex
    """
    with open(file, "rb") as f:
        hash = hashlib.md5()
        chunk = f.read(8192)
        while chunk:
            hash.update(chunk)
            chunk = f.read(8192)

        return hash.hexdigest()
