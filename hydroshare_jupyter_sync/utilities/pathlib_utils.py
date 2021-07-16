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


def expand_and_resolve_path_to_posix(p: Union[str, Path]) -> str:
    """Given a string or Path, expand the user (~) and resolve the absolute path and
    return it's POSIX string representation.

    Parameters
    ----------
    p : Union[str, Path]
        string or path

    Returns
    -------
    str
        POSIX absolute path
    """
    return expand_and_resolve(p).as_posix()


def is_descendant(child: Union[str, Path], parent: Union[str, Path]) -> bool:
    """Determine if a child path is descendant of some parent path.

    Parameters
    ----------
    child : Union[str, Path]
    parent : Union[str, Path]

    Returns
    -------
    bool
        Is child of parent?
    """
    child = expand_and_resolve_path_to_posix(child)
    parent = expand_and_resolve_path_to_posix(parent)

    return child.startswith(parent)
