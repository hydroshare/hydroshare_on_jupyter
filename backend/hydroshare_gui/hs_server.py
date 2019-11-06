#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal
import logging
from get_info import get_files_in_directory_with_metadata

import tornado.ioloop
import tornado.web
import tornado.options


class GetResourceHandler(tornado.web.RequestHandler):
    def get(self):
        data = get_files_in_directory_with_metadata()
        self.write(data)

class SecondHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello vicky!")

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
    (r"/vicky", SecondHandler)
])

def start_server():
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, application.signal_handler)
    application.listen(8080)
    tornado.ioloop.PeriodicCallback(application.try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()

if __name__ == '__main__':
    start_server()
