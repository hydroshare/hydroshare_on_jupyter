from distutils.core import setup

setup(
    name='hydroshare_jupyter_sync',
    version='0.1.0',
    author='CUAHSI',
    author_email='scope-cuahsi@olin.edu',
    packages=[],
    url='github.com/hydroshare/hydroshare_jupyter_sync',
    license='',
    description='A web app and server for syncing files between the local filesystem and HydroShare. Can run as a'
                ' Jupyter notebook extension.',
    install_requires=[
        'notebook>=5.5.0',
        'tornado',
        'certifi>=2019.11.28',
        'chardet>=3.0.4',
        'hs-restclient>=1.3.5',
        'idna>=2.9',
        'oauthlib>=3.1.0',
        'requests>=2.23.0',
        'requests-oauthlib>=1.3.0',
        'requests-toolbelt>=0.9.1',
        'tornado>=6.0.3',
        'urllib3>=1.25.8',
    ],
)
