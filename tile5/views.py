# Create your views here.

from google.appengine.api import mail
from django.http import HttpResponse
from django.shortcuts import render_to_response
import logging
import os
import re

def empty_file(request):
    return HttpResponse()
    
def main(request):
    page_path = re.sub(r'^(.*?)(\.htm|\.html)?$', r'\1', request.path)
    page_name = re.sub(r'.*\/(.*)$', r'\1', page_path);
    
    # find the template name
    template_name = 'tile5' + page_path + '.html'
    index_template_name = 'tile5' + page_path + 'index.html'

    abs_templatepath = os.path.abspath("templates/" + template_name)
    
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
    return render_to_response(template_name, { 'pagename': page_name, 'pagepath': page_path })