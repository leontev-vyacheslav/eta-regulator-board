#!/bin/sh
# using a external production WSGI server (Gunicorn)
export PATH=$PATH:/mnt/mmcblk0p1/eta-regulator-board/bin && #
export PYTHONPATH=$PYTHONPATH:/mnt/mmcblk0p1/eta-regulator-board/lib/python3.6/site-packages && #
gunicorn --workers=1 --threads=6 --timeout=120 --pid=PID_FILE --bind=0.0.0.0:5000 --chdir=./src --env REGULATOR_ENGINE_LOGGING_TO_FILE=1 app:app