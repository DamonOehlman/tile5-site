import os
from webapp2 import WSGIApplication, Route, RedirectHandler
from google.appengine.ext.webapp.util import run_wsgi_app

application = WSGIApplication([
    Route(r'/demos/mapping/', RedirectHandler, defaults={'url': '/demos/mapping'})])

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()