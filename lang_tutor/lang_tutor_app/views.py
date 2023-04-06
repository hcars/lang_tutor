from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponseBadRequest
from . import models
from django.db.utils import IntegrityError
from datetime import date

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
            
        return HttpResponseRedirect("")
    elif request.method == "GET":
        return render(request, "signup.html")

def login(request):
    return render(request, "login.html")