import os
import time
from datetime import datetime, timedelta

from omega.ds1307 import DS1307

#from omega.ds1307 import DS1307

is_started = False
is_done = False

time_zone = 3
pumping_duration = 90  # minutes

start_hour = 1
start_minutes = 30

with DS1307(0x68) as rtc:
    rtc_now = rtc.read_datetime()
    rtc_now += timedelta(hours=3)

    datetime_on = datetime(
        year=rtc_now.year,
        month=rtc_now.month,
        day=rtc_now.day + 1,
        hour=start_hour,
        minute=start_minutes,
        second=0,
    )

    datetime_off = datetime_on + timedelta(minutes=pumping_duration)

    while True:
        rtc_now = rtc.read_datetime()
        rtc_now += timedelta(hours=time_zone)

        if not is_done:
            if not is_started and rtc_now > datetime_on:
                gpio_command = 'fast-gpio set 3 1'
                os.system(gpio_command)
                is_started = True

            if is_started and rtc_now > datetime_off:
                gpio_command = 'fast-gpio set 3 0'
                os.system(gpio_command)
                is_done = True

        time.sleep(5)
