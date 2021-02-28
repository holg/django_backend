from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _
app_name = 'django_backend'
class DjangoBackendConfig(AppConfig):
    name = 'django_backend'
    verbose_name = _('Backend')

    def ready(self):
        from . import signals
