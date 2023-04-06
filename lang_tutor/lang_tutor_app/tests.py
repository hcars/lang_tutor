from django.test import TestCase
import json
from django.http import HttpRequest, HttpResponseBadRequest
from . import models
from . import views
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
