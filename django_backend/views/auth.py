from django.contrib.auth import REDIRECT_FIELD_NAME, login as auth_login, logout as auth_logout, get_user_model
from django.contrib.auth import views as auth_views
from django.contrib.auth.forms import AuthenticationForm as _AuthenticationForm
try: # htr dj3 fix
    from django.urls import reverse
except Exception:
    from django.core.urlresolvers import reverse
from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils.http import is_safe_url
from django.views.generic import TemplateView
import floppyforms as forms

def get_REQUEST(request, param, default=''):
    return request.POST.get(param) if request.POST.get(param) else request.GET.get(param, default)

class AuthenticationForm(_AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(AuthenticationForm, self).__init__(*args, **kwargs)
        self.fields['username'].widget = forms.TextInput()
        self.fields['password'].widget = forms.PasswordInput()


class LoginView(TemplateView):
    template_name = 'django_backend/login.html'
    redirect_field_name = REDIRECT_FIELD_NAME

    def get(self, request, *args, **kwargs):
        redirect_to = get_REQUEST(self.request, self.redirect_field_name, '')
        form = AuthenticationForm(request)
        return self.render_to_response({
            'form': form,
            self.redirect_field_name: redirect_to,
        })

    def post(self, request, *args, **kwargs):
        redirect_to = get_REQUEST(self.request, self.redirect_field_name, '')
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            # Ensure the user-originating redirection url is safe.
            if settings.DJANGO_MAJOR_VERSION >= 2:
                is_safe = is_safe_url(url=redirect_to, allowed_hosts=settings.ALLOWED_HOSTS)
            else:
                is_safe = is_safe_url(url = redirect_to, host = request.get_host())
            if not is_safe:
                redirect_to = reverse('django_backend:index')
            # Okay, security check complete. Log the user in.
            auth_login(request, form.get_user())
            return HttpResponseRedirect(redirect_to)
        return self.render_to_response({
            'form': form,
            self.redirect_field_name: redirect_to,
        })


class LogoutView(TemplateView):
    template_name = 'django_backend/logged_out.html'

    def handle(self, request, *args, **kwargs):
        return auth_views.logout(request,
            template_name=self.get_template_names())

    get = post = handle
