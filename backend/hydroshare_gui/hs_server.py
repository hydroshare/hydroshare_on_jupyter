'''
This file sets up the hydroshare server for communicating with the
hydroshare gui frontend.

Author: 2019-20 CUAHSI Olin SCOPE Team
Email: vickymmcd@gmail.com
'''
#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal
import logging
from get_info import (get_files_HS,
                      get_files_JH,
                      get_user_info,
                      get_list_of_user_resources)

import tornado.ioloop
import tornado.web
import tornado.options

# get user information
# get list of resources
# list of contents for those resources

# Get: List of user resources in HS and JH
# Post: Creates new HS resource, returns new resource ID

''' Class that handles GETing a list of a user's resources & POSTing
a new resource for that user
'''
class ResourcesHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(get_list_of_user_resources())

    def post(self):
        pass


''' Class that handles GETing list of a files that are in a user's
hydroshare instance of a resource
'''
class ResourcesFileHandlerHS(tornado.web.RequestHandler):
    def get(self, res_id):
        self.write(get_files_HS(res_id))


''' Class that handles GETing list of a files that are in a user's
jupyterhub instance of a resource
'''
class ResourcesFileHandlerJH(tornado.web.RequestHandler):
    def get(self, res_id):
        self.write(get_files_JH(res_id))


''' Class that handles GETing user information on the currently logged
in user including name, email, username, etc.
'''
class UserInfoHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        data = get_user_info()
        self.write(data)


''' Class for setting up the server & making sure it can exit cleanly
'''
class HydroShareGUI(tornado.web.Application):
    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info('exiting...')
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
            tornado.ioloop.IOLoop.instance().stop()
            logging.info('exit success')


''' Returns an instance of the server with the appropriate endpoints
'''
def make_app():
    application = HydroShareGUI([
        (r"/user", UserInfoHandler),
        (r"/resources", ResourcesHandler),
        (r"/resources/([^/]+)/HSfiles", ResourcesFileHandlerHS),
        (r"/resources/([^/]+)/localfiles", ResourcesFileHandlerJH)
    ])
    return application

''' Starts running the server
'''
def start_server(application):
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, application.signal_handler)
    application.listen(8080)
    tornado.ioloop.PeriodicCallback(application.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    application = make_app()
    start_server(application)
