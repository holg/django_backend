def autoload_backends():
    from django.conf import settings
    try:
        from importlib import import_module
    except ImportError:
        from django.utils.importlib import import_module

    from django.utils.module_loading import module_has_submodule

    for app in settings.INSTALLED_APPS:
        mod = import_module(app)
        try:
            import_module('%s.backend' % app)
        except:
            if module_has_submodule(mod, 'backend'):
                raise
