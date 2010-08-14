# Create your views here.

from google.appengine.api import mail
from django.http import HttpResponse
from django.shortcuts import render_to_response
import logging
import os

def empty_file(request):
    return HttpResponse()
    
def main(request):
    # find the template name
    template_name = 'tile5' + request.path + '.html'
    abs_templatepath = os.path.abspath("templates/" + template_name)
    
    index_template_name = page_data.get('template', 'tile5' + request.path) + 'index.html'
    
    # if we could not find the specified template, use the page not found template
    logging.info("looking for template: %s", abs_templatepath)
    if not os.path.exists(abs_templatepath):
        # check the index file
        abs_templatepath = os.path.abspath("templates/" + index_template_name)
        if os.path.exists(abs_templatepath):
            template_name = index_template_name
        else:
            template_name = 'tile5/page-not-found.html'
    
	# define the page context
    return render_to_response(template_name, page_data)