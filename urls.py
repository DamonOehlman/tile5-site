# Copyright 2008 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.conf.urls.defaults import *
from tile5 import views as tile5_views

urlpatterns = patterns('',
    (r'^MJ12_FAD7BA2F940521B01DE13B79912B256D\.txt$', tile5_views.empty_file),
    (r'^mapping/?$', 'django.views.generic.simple.redirect_to', {'url': '/html5-mapping'}),
    (r'^docs/api/?$', 'django.views.generic.simple.redirect_to', {'url': '/docs/api/README.mdown.html'}),
    (r'^demos/flickr.*', 'django.views.generic.simple.redirect_to', {'url': '/photogrid'}),
    (r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/media/img/favicon.ico'}),
    (r'^.*', tile5_views.main),
)
