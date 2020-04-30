"""
This file sets up tornado unit tests to test the hydroshare server
Author: 2019-20 CUAHSI Olin SCOPE Team
"""
from hydroshare_jupyter_sync.server import TestApp, get_route_handlers
from tornado.testing import AsyncHTTPTestCase, gen_test
import unittest

import nest_asyncio
nest_asyncio.apply()


class TestHSServer(AsyncHTTPTestCase):
    """ Create an instance of the server for running tests """
    def get_app(self):
        return TestApp(get_route_handlers('/', '/syncApi'))

    @gen_test
    def test_user(self):
        """ Tests get user info functionality """
        response = self.fetch(r"/syncApi/user")
        self.assertEqual(response.code, 200)
        # make sure the string "username" is in the response
        un = 'username'
        un = un.encode('ascii')
        self.assertIn(un, response.body)

    @gen_test
    def test_resources(self):
        """ Tests get user resources functionality """
        response = self.fetch(r"/syncApi/resources")
        self.assertEqual(response.code, 200)
        # make sure the string "resources" is in the response
        res = 'resources'
        res = res.encode('ascii')
        self.assertIn(res, response.body)


if __name__ == '__main__':
    unittest.main()
