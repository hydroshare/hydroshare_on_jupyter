#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal
import logging
from get_info import get_files_HS, get_files_JH, get_user_info, get_list_of_user_resources

import tornado.ioloop
import tornado.web
import tornado.options

# get user information
# get list of resources
# list of contents for those resources

# Get: List of user resources in HS and JH
# Post: Creates new HS resource, returns new resource ID
class ResourcesHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(get_list_of_user_resources())

    def post(self):
        pass

class ResourcesFileHandlerHS(tornado.web.RequestHandler):
    def get(self, res_id):
        self.write(get_files_HS(res_id))

class ResourcesFileHandlerJH(tornado.web.RequestHandler):
    def get(self, res_id):
        self.write(get_files_JH(res_id))

class UserInfoHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        data = get_user_info()
        self.write(data)


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
    (r"/user", UserInfoHandler),
    (r"/resources", ResourcesHandler),
    (r"/resources/([^/]+)/HSfiles", ResourcesFileHandlerHS),
    (r"/resources/([^/]+)/localfiles", ResourcesFileHandlerJH)
])

def start_server():
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, application.signal_handler)
    application.listen(8080)
    tornado.ioloop.PeriodicCallback(application.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    start_server()
