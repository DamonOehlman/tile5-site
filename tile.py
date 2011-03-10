import os, sys
import tarfile
import logging
import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

open_archives = {}

def open_archive(z, x):
    archive_file_z = os.path.abspath("img/tiles/%s.tar.gz" % (z))
    archive_file_zx = os.path.abspath("img/tiles/%s/%s.tar.gz" % (z, x))
    
    if (os.path.exists(archive_file_z)):
        logging.info("opening %s", archive_file_z)
        open_archives[z] = tarfile.open(archive_file_z, 'r:gz')
    elif (os.path.exists(archive_file_zx)):
        open_archives["%s_%s" % (z, x)] = tarfile.open(archive_file_zx, 'r:gz')

def get_tile(z, x, y):
    # TODO: add memcache support
    if (not ((z in open_archives) or (("%s_%s" % (z, x)) in open_archives))):
        open_archive(z, x)
        
    if (z in open_archives): 
        return open_archives[z].extractfile("%s/%s/%s.png" % (z, x, y))
    else:
        archive_key = "%s_%s" % (z, x)
        if (archive_key in open_archives):
            return open_archives[archive_key].extractfile("%s/%s.png" % (x, y))
    
    return None

class LoadTileHandler(webapp.RequestHandler):
    def get(self, z, x, y):
        self.response.headers['Content-Type'] = 'image/png'
        
        # get the tile
        requested_tile = get_tile(z, x, y)
        if requested_tile:
            self.response.out.write(requested_tile.read())

application = webapp.WSGIApplication(
                                     [(r'/tile/(\d+)/(\d+)/(\d+).png', LoadTileHandler)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()