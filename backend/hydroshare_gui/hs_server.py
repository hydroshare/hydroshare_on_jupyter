#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal
import logging
from get_info import get_metadata

import tornado.ioloop
import tornado.web
import tornado.options


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        test_resource_id = '8b826c43f55043f583c85ae312a8894f'
        data = get_metadata(test_resource_id)['resource_title']
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
    (r"/", MainHandler),
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
