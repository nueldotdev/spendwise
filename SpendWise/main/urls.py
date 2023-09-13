from . import views
from django.urls import path

urlpatterns = [
    path("", views.landing, name='landing'),
    path("home", views.home, name='home'),
    path("home/<slug:slug>", views.active_wallet, name='wallet'),
    path("signup", views.signup, name='signup'),
    path("login", views.login, name='login'),
]