"""
Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss

Maintainer: Austin Raney
Maintainer Email: araney@cuahsi.org
Maintainer Affiliation: CUAHSI
"""
# TODO: add citation
import os
import sys
import glob
import shutil
from pathlib import Path
import subprocess
from setuptools import Command, setup, find_packages
from setuptools.command.install import install

# define package name globally
PKGNAME = "hydroshare_jupyter_sync"
VERSION = "0.1.2"

# define webapp path globally
here = Path(__file__).resolve().parent.absolute()
webpath = here / "webapp"

# Package author information
AUTHOR = "CUAHSI"
AUTHOR_EMAIL = "scope-cuahsi@olin.edu"

MAINTAINER = "Austin Raney"
MAINTAINER_EMAIL = "araney@cuahsi.org"

# package version requirement
PYTHON_REQUIRES = ">=3.7"

# Package dependency requirements
REQUIREMENTS = [
    "hs-restclient",  # TODO: remove hs-restclient
    "hsclient",
    "jupyterlab",
    "notebook",
    "requests",
    "pydantic[dotenv]",
]

# Development requirements
DEVELOPMENT_REQUIREMENTS = ["pytest", "pytest-tornado"]

SHORT_DESCRIPTION = "A web app and server for syncing files between the local filesystem and HydroShare. Can run as a Jupyter notebook extension."

# Long description
with (Path(__file__).parent / "README.md").open("r") as f:
    LONG_DESCRIPTION = f.read()


def run_command(command, cwd):
    process = subprocess.Popen(command, cwd=cwd, stdout=subprocess.PIPE)
    for line in process.stdout:
        sys.stdout.write(line.decode("utf-8"))


class build_react(install):
    def run(self):
        # build and install the Sync Webapp
        cmd = ["yarn", "install"]
        run_command(cmd, cwd=webpath)

        cmd = ["yarn", "build"]
        run_command(cmd, cwd=webpath)

        # move files to python build dir
        assets = os.path.join(webpath, "public", "assets")
        target_path = os.path.join(os.getcwd(), PKGNAME, "assets")
        if os.path.exists(target_path):
            shutil.rmtree(target_path)
        shutil.copytree(assets, target_path)


class CleanCommand(Command):
    """Custom clean command to tidy up the project root."""

    CLEAN_FILES = [
        "./build",
        "./dist",
        "./*.pyc",
        "./*.tgz",
        "./*.egg-info",
        "./webapp/build",
        "./webapp/node_modules",
    ]

    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):

        for path_spec in self.CLEAN_FILES:
            # Make paths absolute and relative to this path
            abs_paths = glob.glob(os.path.normpath(os.path.join(here, path_spec)))
            for path in [str(p) for p in abs_paths]:
                if not path.startswith(here):
                    # Die if path in CLEAN_FILES is absolute
                    # + outside this directory
                    raise (ValueError)("%s is not a path inside %s" % (path, here))
                print("removing %s" % os.path.relpath(path))
                shutil.rmtree(path)


setup(
    cmdclass={
        "build_react": build_react,
        "clean": CleanCommand,
    },
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
