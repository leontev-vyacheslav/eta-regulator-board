from datetime import datetime
from flask_pydantic import validate

from app import app
from models.rtc_datetime_model import RtcDatetime
from omega.ds1307 import DS1307
from utils.debug_helper import is_debug


@app.api_route('/rtc', methods=['GET'])
@validate()
def get_rtc():

    if is_debug():
        return {'debug-datetime':  datetime.now()}

    with DS1307() as rtc:
        rtc_now = rtc.read_datetime()

    return {'datetime':  rtc_now}


@app.api_route('/rtc', methods=['POST'])
@validate()
def post_rtc(body: RtcDatetime):

    if is_debug():
        return {'debug-datetime':  body.datetime}

    with DS1307() as rtc:
        rtc.write_datetime(body.datetime)

    return {'datetime':  body.datetime}
