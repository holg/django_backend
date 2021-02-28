from django.conf import settings

if settings.DJANGO_MAJOR_VERSION >= 2:
    from django.urls import reverse, resolve
    from django.urls import path
    from django.urls import re_path as url
    from wsgiref.util import FileWrapper
elif DJANGO_MAJOR_VERSION < 2:
    from django.conf.urls import url#, path
    from django.core.urlresolvers import reverse, resolve
    from django.core.servers.basehttp import FileWrapper
from django.conf.urls import include
from .sitebackend import SiteBackend
site = SiteBackend(id='backend')
app_name = 'django_backend'
urlpatterns = [
    url(r'', include(site.get_urls())),
]
