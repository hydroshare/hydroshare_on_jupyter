from pathlib import Path

# type hints imports
from typing import Union


def expand_and_resolve(p: Union[str, Path]) -> Path:
    """Given a string or Path, expand the user (~) and resolve the absolute path.

    Parameters
    ----------
    p : Union[str, Path]
        string or path

    Returns
    -------
    Path
    """
    return Path(p).expanduser().resolve()
