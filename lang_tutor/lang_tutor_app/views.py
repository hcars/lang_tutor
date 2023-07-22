from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponseBadRequest, HttpResponse, JsonResponse
from . import models
from django.db.utils import IntegrityError
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.conf import settings # import the settings file
import openai

LLM_SYSTEM_PROMPT = "You are a language tutor. Your job is to chat with the user in their target language. Do not stop using their target language! After each chat they send you, first, provide feedback on any grammatical mistakes or bad diction and second, respond to their chat in an engaging manner."

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
        if request.user.is_paying:
            openai.organization = settings.OPENAI_API_ORGANIZATION
            openai.api_key = settings.OPENAI_API_KEY
            msg = request.POST.get("message")
            
            if 'history' not in request.session:
                request.session['history'] = []
            elif len(request.session['history']) >= 8:
                request.session['history'] = request.session['history'][8:]

            messages = [
                {"role": "system", "content":  LLM_SYSTEM_PROMPT},
                {"role": "system", "content": f"Language: " + request.POST.get("lang")},
            ]
            for prev_msg in request.session['history']:
                messages.append({"role": "user", "content": prev_msg})
            messages.append({"role": "user", "content": msg})
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo-0301",
                temperature=.2,
                messages=messages
            )
            request.session['history'].append(msg)
            response_msg = response["choices"][0]["message"]["content"]
            return JsonResponse({"chat_response": response_msg})
        else:
            return HttpResponseBadRequest("User is not paying.")
    elif request.method == "GET": 
        return render(request, "chat.html", {})
    else:
        return HttpResponseBadRequest()
