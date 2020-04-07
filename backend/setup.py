# comment outs were to test different package install methods while troubleshooting server incapability
from distutils.core import setup


setup(
    name='hydroshare_gui',  # spiffy: need to decide on the name we're going with (hs_sync?)
    version='0.1.0',
    author='CUAHSI SCOPE team 2019',
    author_email='scope-cuahsi@olin.edu',
    packages=[],
    url='',  # spiffy: The GitHub repo?
    license='',  # spiffy: We should ask CUAHSI if they want us to use the same as https://github.com/hydroshare/hydroshare/blob/develop/LICENSE.txt
    description='hydroshare gui app.',  # spiffy: this should be better
    # spiffy: Should we require versions >= or exactly equal to the ones specified?
    install_requires=['notebook>=5.5.0',
                        'tornado',
                        'certifi==2019.11.28',
                        'chardet==3.0.4',
                        'hs-restclient==1.3.5',
                        'idna==2.9',
                        'oauthlib==3.1.0',
                        'requests==2.23.0',
                        'requests-oauthlib==1.3.0',
                        'requests-toolbelt==0.9.1',
                        'tornado==6.0.3',
                        'urllib3==1.25.8'],
)
