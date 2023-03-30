import os

import openai
from flask import Flask, redirect, render_template, request, url_for

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = "Your goal is to help the user improve their writing skills in a foreign language. Respond in the language that they have chosen. The user begins the conversation by saying the target language. You must provide a rating of their grammar and diction on a scale of 1 to 10. Tag the rating with JSON fields that are easily identifiable. State the reason for their ratings with suggested improvements with specific citations from their dialogue. Lastly, provide an engaging reply to their response, so you can engage in a dialogue for practice. Try to be as grammatical as possible while sounding natural."

@app.route("/", methods=("GET", "POST"))
def index(language=False, history=[]):
    if request.method == "POST":
        dialogue = request.form["dialogue"]
        language = "Target Language: " + request.form["language"]
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0301",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": language}] + history + [{"role": "user", "content": dialogue}],
            max_tokens=500,
            temperature=.25
        )
        history.append({"role": "user", "content": dialogue})
        history.append({"role": "assistant", "content": response.choices[0].message.content})
        print(history)
        return redirect(url_for("index", result=response.choices[0].message.content, history=history, language=language))
    language = request.args.get("language")
    result = request.args.get("result")
    return render_template("index.html", result=result, language=language)



