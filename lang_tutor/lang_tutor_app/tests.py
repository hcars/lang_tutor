from django.test import TestCase
import json
from django.contrib.sessions.backends.db import SessionStore
from django.http import HttpRequest, HttpResponseBadRequest
from . import models
from . import views
from django.conf import settings
from importlib import import_module
# Create your tests here.


class Users(TestCase):
    def setUp(self):
        
        models.User.objects.create_user(username="cool_guyu", email="cool@mail.com", password="testingMe")

    def test_single_sign_up(self):
        """Test a user can be created."""

        request = HttpRequest()
        request.method = 'POST'
        request.POST['username'] = 'my_user'
        request.POST['email'] = 'test@mail.com'
        request.POST['password'] = '1234testing1234'
        response = views.signup(request)
        get_user = models.User.objects.get(username="my_user", email="test@mail.com")
        self.assertEqual(get_user.username, "my_user")
        self.assertEqual(get_user.email, "test@mail.com")
        users = models.User.objects.count()
        self.assertEqual(users, 2)

    def test_unique_sign_up_1(self):
        """Test a user can be created."""
        request = HttpRequest()
        request.method = 'POST'
        request.POST['username'] = 'cool_guyu'
        request.POST['email'] = 'test@mail.com'
        request.POST['password'] = '1234testing1234'
        response = views.signup(request)
        self.assertEqual(response.status_code, 400)

    def test_unique_sign_up_2(self):
        request = HttpRequest()
        request.method = 'POST'
        request.POST['username'] = 'awesome_dude'
        request.POST['email'] = 'cool@mail.com'
        request.POST['password'] = '1234testing1234'
        response = views.signup(request)
        self.assertEqual(response.status_code, 400)
    

    def test_success_sign_in(self):
        request = HttpRequest()
        engine = import_module(settings.SESSION_ENGINE)
        session_key = None
        request.session = engine.SessionStore(session_key)
        request.method = 'POST'
        request.POST['username'] = 'cool_guyu'
        request.POST['password'] = 'testingMe'
        response = views.login_view(request)
        self.assertEqual(response.content, bytes("<p> Success! </p>", 'utf-8'))
    
    def test_failed_sign_in(self):
        request = HttpRequest()
        engine = import_module(settings.SESSION_ENGINE)
        session_key = None
        request.session = engine.SessionStore(session_key)
        request.method = 'POST'
        request.POST['username'] = 'cool_guyu'
        request.POST['password'] = 'testiMe'
        response = views.login_view(request)
        self.assertEqual(response.content, bytes("Login Failed", 'utf-8'))
        
