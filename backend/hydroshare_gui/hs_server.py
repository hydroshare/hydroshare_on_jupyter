#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal
import logging
from get_info import get_files_in_directory_with_metadata, get_user_info

import tornado.ioloop
import tornado.web
import tornado.options

# get user information
# get list of resources
# list of contents for those resources


class GetResourceHandler(tornado.web.RequestHandler):
    def get(self):
        data = "metadata for one resource"
        self.write(data)
        
# Post: Update resource info to make public

# Get: List of user resources in HS
class ListOfUserResourcesHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("This is a list of user resources")

# Get contents of resource
class ResourceContentsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("These are the contents of the resource (names and link to resource)")

class UserInfoHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("User info")

class NewProjectHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Create new project")

class HydroShareGUI(tornado.web.Application):
    is_closing = False

    def signal_handler(self, signum, frame):
        logging.info('exiting...')
        self.is_closing = True

    def try_exit(self):
        if self.is_closing:
            tornado.ioloop.IOLoop.instance().stop()
            logging.info('exit success')


application = HydroShareGUI([
    (r"/", GetResourceHandler),
    (r"/new", NewProjectHandler),
    (r"/listofuserresources", ListOfUserResourcesHandler)
    (r"/resourcecontents", ResourceContentsHandler)
    (r"/userinfo", UserInfoHandler)
])

def start_server():
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, application.signal_handler)
    application.listen(8080)
    tornado.ioloop.PeriodicCallback(application.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    start_server()
