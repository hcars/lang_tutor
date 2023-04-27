from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponseBadRequest, HttpResponse
from . import models
from django.db.utils import IntegrityError
from django.contrib.auth import authenticate, login

# Create your views here.
def index(request):
    return render(request, "index.html")

def signup(request):
    if request.method == "POST":
        try:
            user = models.User.objects.create_user(username=request.POST.get("username"),  email=request.POST.get("email"), password=request.POST.get("password"))
            user.save()
        except IntegrityError as e:
            print(e)
            return HttpResponseBadRequest("<h1>Username or Email taken. </h1>")
        except Exception as e:
            print(e)
            return HttpResponseBadRequest("Something went wrong.")
            
        return HttpResponseRedirect("")
    elif request.method == "GET":
        return render(request, "signup.html")

def login_view(request):
    if request.method == "GET":
        return render(request, "login.html")
    elif request.method == "POST":
        try:
            username = request.POST.get("username")
            password = request.POST.get("password")
            user = authenticate(request, username=username, password=password)
        except Exception as e:
            print(e)
            return HttpResponseBadRequest("Something went wrong.")
        if user is not None:
            login(request, user)
            return HttpResponse("<p> Success! </p>")
        else:
            return HttpResponseBadRequest("Login Failed")
