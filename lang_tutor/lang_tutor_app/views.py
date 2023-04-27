from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponseBadRequest, HttpResponse
from . import models
from django.db.utils import IntegrityError
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.conf import settings # import the settings file
import openai



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
            return render(request, "index.html")
        else:
            return HttpResponseBadRequest("Login Failed")

@login_required
def chat(request):
    if request.method == "POST":
        openai.organization = "org-UAmuQ4eJWH9XRCr1F5Kh0a3f"
        openai.api_key = settings.OPENAI_API_KEY
        print(openai.api_key)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0301",
            temperature=.2,
            messages=[
                {"role": "system", "content": "You are language tutor. Your job is to chat with the user in their target language. After each chat they send you, keep the conversation going and provide feedback on any grammatical mistakes or bad diction. Language: German"},
                {"role": "user", "content": request.POST.get("message")}
            ]
        )
        return render(request, "chat.html", {"chat_response": response["choices"][0]["message"]["content"]})
    elif request.method == "GET": 
        return render(request, "chat.html", {})
    else:
        return HttpResponseBadRequest()
