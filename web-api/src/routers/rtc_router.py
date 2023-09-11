from datetime import datetime
from flask_pydantic import validate

from app import app
from models.rtc_datetime_model import RtcDateTimeModel
from omega.ds1307 import DS1307
from utils.debug_helper import is_debug


@app.api_route('/rtc', methods=['GET'])
@validate()
def get_rtc() -> RtcDateTimeModel:

    if is_debug():
        return RtcDateTimeModel(datetime=datetime.now())

    with DS1307() as rtc:
        rtc_now = rtc.read_datetime()

    return RtcDateTimeModel(datetime=rtc_now)


@app.api_route('/rtc', methods=['PUT'])
@validate()
def put_rtc(body: RtcDateTimeModel):

    if is_debug():
        return RtcDateTimeModel(datetime=datetime.now())

    with DS1307() as rtc:
        rtc.write_datetime(body.datetime)

    return body
