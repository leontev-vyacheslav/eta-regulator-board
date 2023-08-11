#!/bin/sh

# using a embedded WSGI server (Werkzeug)
# export FLASK_APP=src/app.py
# export FLASK_ENV=production
# flask run --host=0.0.0.0

# using a external production WSGI server (Gunicorn)
gunicorn --workers=1 --pid=PID_FILE --bind=0.0.0.0:5000 --chdir=./src app:app