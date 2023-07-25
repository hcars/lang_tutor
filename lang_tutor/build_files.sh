# build_files.sh
pip install -r requirements.txt
python3.9 manage.py collectstatic --noinput
python3.9 manage.py makemigrations
python3.9 manage.py migrate
python3.9 manage.py createsuperuser --noinput || true