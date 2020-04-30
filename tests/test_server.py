'''
This file sets up tornado unit tests to test the hydroshare server

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
from hydroshare_jupyter_sync.server import make_app
from tornado.testing import AsyncHTTPTestCase, gen_test
import unittest

# weird thing I had to do get rid of "loop already running error"
# see https://github.com/spyder-ide/spyder/issues/7096
import nest_asyncio
nest_asyncio.apply()


class TestHSServer(AsyncHTTPTestCase):
    """ Create an instance of the server for running tests """
    def get_app(self):
        return make_app()

    @gen_test
    def test_user(self):
        """ Tests get user info functionality """
        response = self.fetch(r"/user")
        self.assertEqual(response.code, 200)
        # make sure the string "username" is in the response
        un = 'username'
        un = un.encode('ascii')
        self.assertIn(un, response.body)

    @gen_test
    def test_resources(self):
        """ Tests get user resources functionality """
        response = self.fetch(r"/resources")
        self.assertEqual(response.code, 200)
        # make sure the string "Resources" is in the response
        res = 'Resources'
        res = res.encode('ascii')
        self.assertIn(res, response.body)

    @gen_test
    def test_localfiles(self):
        """ Tests get local files functionality """
        response = self.fetch(r"/resources/8b826c43f55043f583c85ae312a8894f"
                              "/local-files")
        self.assertEqual(response.code, 200)
        # make sure the string "Files" is in the response
        res = 'Files'
        res = res.encode('ascii')
        self.assertIn(res, response.body)

    @gen_test
    def test_HSfiles(self):
        """ Tests get HydroShare files functionality """
        response = self.fetch(r"/resources/8b826c43f55043f583c85ae312a8894f"
                              "/hs-files")
        self.assertEqual(response.code, 200)
        # make sure the string "Files" is in the response
        res = 'Files'
        res = res.encode('ascii')
        self.assertIn(res, response.body)


if __name__ == '__main__':
    unittest.main()
