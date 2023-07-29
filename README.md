# LangTutor

This is a fun little app that I made to play around with the OpenAI API. It helps users build fluency by offering a language partner that will correct them on grammar and keep up a conversation.

# Instructions 

Ensure you provide a .env file that populates the variables required by the site.

Run the commands listed in build.sh

  pip install -r requirements.txt
  python3.9 manage.py collectstatic --noinput
  python3.9 manage.py makemigrations
  python3.9 manage.py migrate
  python3.9 manage.py createsuperuser --noinput || true  
