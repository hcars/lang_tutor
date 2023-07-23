from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('', views.index, name="index"),
    path('signup', views.signup, name="signup"),
    path('login', views.login_view, name="login"),
    path('chat', views.chat, name="chat"),
    path('logout', LogoutView.as_view(), name="logout"),
    path('about', views.about, name="about")
]