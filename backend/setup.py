import setuptools

setuptools.setup(
    name='hydroshare_jupyter_sync',
    version='0.1.1',
    author='CUAHSI',
    author_email='scope-cuahsi@olin.edu',
    packages=setuptools.find_packages(),
    url='https://github.com/hydroshare/hydroshare_jupyter_sync',
    license='',
    description='A web app and server for syncing files between the local filesystem and HydroShare. Can run as a'
                ' Jupyter notebook extension.',
    install_requires=[
        'tornado',
        'hs-restclient',
    ],
)
