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
from sidelab import views as sidelab_views
from social_auth.urls import urlpatterns as auth_patterns
from linkedin_cv import views as linkedin_views

urlpatterns = auth_patterns + patterns('',
    (r'^MJ12_FAD7BA2F940521B01DE13B79912B256D\.txt$', sidelab_views.empty_file),
    (r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/media/img/favicon.ico'}),
    (r'^.*', sidelab_views.main),
)
