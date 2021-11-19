"""
Intellectual Property: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss

Author: Austin Raney
Author Email: araney@cuahsi.org
Author Affiliation: CUAHSI

Maintainer: Austin Raney
Maintainer Email: araney@cuahsi.org
Maintainer Affiliation: CUAHSI
"""
# TODO: add citation
from pathlib import Path
from setuptools import setup, find_packages

# define package name globally
PKGNAME = "hydroshare_on_jupyter"
VERSION = "0.2.2"

# define webapp path globally
here = Path(__file__).resolve().parent
webpath = here / "webapp"

# path to pre-built lab-extension
EXTENSION_NAME = "hydroshare_jupyter_sync"
LABEXTENSION_PATH = here / EXTENSION_NAME / "labextension"

# Package author information
AUTHOR = "CUAHSI"
AUTHOR_EMAIL = "scope-cuahsi@olin.edu"

MAINTAINER = "Austin Raney"
MAINTAINER_EMAIL = "araney@cuahsi.org"

# package version requirement
PYTHON_REQUIRES = ">=3.7"

# Package dependency requirements
REQUIREMENTS = [
    "hsclient>=0.2.0",
    "jupyterlab",
    "notebook",
    "requests",
    "pydantic[dotenv]",
    "watchdog",
]

# Development requirements
DEVELOPMENT_REQUIREMENTS = ["pytest", "pytest-tornado"]

SHORT_DESCRIPTION = "A web app and server for syncing files between the local filesystem and HydroShare. Can run as a Jupyter notebook extension."


# Long description
with (Path(__file__).parent / "README.md").open("r") as f:
    LONG_DESCRIPTION = f.read()

if __name__ == "__main__":
    setup(
        name=PKGNAME,
        version=VERSION,
        python_requires=PYTHON_REQUIRES,
        author=AUTHOR,
        author_email=AUTHOR_EMAIL,
        maintainer=MAINTAINER,
        maintainer_email=MAINTAINER_EMAIL,
        packages=find_packages(),
        url="https://github.com/hydroshare/hydroshare_jupyter_sync",
        license="",
        description=SHORT_DESCRIPTION,
        long_description=LONG_DESCRIPTION,
        long_description_content_type="text/markdown",
        include_package_data=True,
        install_requires=REQUIREMENTS,
        extras_require={"develop": DEVELOPMENT_REQUIREMENTS},
    )
