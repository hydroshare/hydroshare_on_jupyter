"""
This file installs the hydroshare_jupyter_sync package on your computer.
It can be used as a jupyter server extension to launch the sync web app for
syncing files between HydroShare and JupyterHub.

Author: 2019-20 CUAHSI Olin SCOPE Team
Vicky McDermott, Kyle Combes, Emily Lepert, and Charlie Weiss
"""
import os
import sys
import glob
import shutil
import pathlib
import setuptools
import subprocess
from setuptools import Command
from setuptools.command.install import install

# define package name globally
pkgname = 'hydroshare_jupyter_sync'

# define webapp path globally
here = str(pathlib.Path(__file__).parent.absolute())
webpath = os.path.join(here, 'webapp')

# read the requirements file and pass lib names to setuptools
with open('requirements.txt') as f:
    required = f.read().splitlines()


def run_command(command, cwd):
    process = subprocess.Popen(command,
                               cwd=cwd,
                               stdout=subprocess.PIPE)
    for line in process.stdout:
        sys.stdout.write(line.decode('utf-8'))


class build_react(install):
    def run(self):
        # build and install the Sync Webapp
        cmd = ['yarn', 'install']
        run_command(cmd, cwd=webpath)

        cmd = ['yarn', 'build']
        run_command(cmd, cwd=webpath)

        # move files to python build dir
        assets = os.path.join(webpath, 'public', 'assets')
        target_path = os.path.join(os.getcwd(), pkgname, 'assets')
        if os.path.exists(target_path):
            shutil.rmtree(target_path)
        shutil.copytree(assets, target_path)


class CleanCommand(Command):
    """Custom clean command to tidy up the project root."""
    CLEAN_FILES = ['./build',
                   './dist',
                   './*.pyc',
                   './*.tgz',
                   './*.egg-info',
                   './webapp/build',
                   './webapp/node_modules']

    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):

        for path_spec in self.CLEAN_FILES:
            # Make paths absolute and relative to this path
            abs_paths = glob.glob(os.path.normpath(
                                            os.path.join(here, path_spec)))
            for path in [str(p) for p in abs_paths]:
                if not path.startswith(here):
                    # Die if path in CLEAN_FILES is absolute
                    # + outside this directory
                    raise (ValueError)("%s is not a path inside %s"
                                       % (path, here))
                print('removing %s' % os.path.relpath(path))
                shutil.rmtree(path)


# standard setuptools args
setuptools.setup(
    cmdclass={
        'build_react': build_react,
        'clean': CleanCommand,
        },
    name=pkgname,
    version='0.1.2',
    author='CUAHSI',
    author_email='scope-cuahsi@olin.edu',
    packages=setuptools.find_packages(),
    url='https://github.com/hydroshare/hydroshare_jupyter_sync',
    license='',
    description='A web app and server for syncing files between the local '
                'filesystem and HydroShare. Can run as a'
                ' Jupyter notebook extension.',
    include_package_data=True,
    install_requires=required,
)
