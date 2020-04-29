import os
import sys
import glob
import shutil
import pathlib
import setuptools
import subprocess
from setuptools import Command
from setuptools.command.install import install
from distutils.command.install import install as _install

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


class install_(install):
    def run(self):
        # this block of code is necessary to preserve the original install
        # functionality. Without it, the python requirements will not be 
        # installed: https://stackoverflow.com/questions/14441955/how-to-perform-custom-build-steps-in-setup-py
        ret = None
        if self.old_and_unmanageable or self.single_version_externally_managed:
            ret = _install.run(self)
        else:
            caller = sys._getframe(2)
            caller_module = caller.f_globals.get('__name__','')
            caller_name = caller.f_code.co_name

            if caller_module != 'distutils.dist' or caller_name!='run_commands':
                _install.run(self)
            else:
                self.do_egg_install()

            return ret


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
            abs_paths = glob.glob(os.path.normpath(os.path.join(here, path_spec)))
            for path in [str(p) for p in abs_paths]:
                if not path.startswith(here):
                    # Die if path in CLEAN_FILES is absolute 
                    # + outside this directory
                    raise ValueError("%s is not a path inside %s" % (path, here))
                print('removing %s' % os.path.relpath(path))
                shutil.rmtree(path)


# standard setuptools args
setuptools.setup(
    cmdclass={
        'install': install_,
        'clean': CleanCommand,
        },
    name=pkgname,
    version='0.1.1',
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
