from datetime import datetime, timedelta
import subprocess

from lockers import hardware_process_lock
from omega.ds1307 import DS1307


def get_last_day_of_month(any_day: datetime):
    # The day 28 exists in every month. 4 days later, it's always next month
    next_month = any_day.replace(day=28) + timedelta(days=4)

    # subtracting the number of the current day brings us back one month
    return next_month - timedelta(days=next_month.day)


def is_last_day_of_month(any_day: datetime):
    last_date = get_last_day_of_month(any_day)

    return last_date.day == any_day.day


def sync_sys_datetime():
    with hardware_process_lock:
        with DS1307() as rtc:
            rtc_now = rtc.read_datetime()
            dt = rtc_now.strftime("%Y-%m-%d %H:%M:%S")
            try:
                 subprocess.run(f'date -s "{dt}" -u', check=True)

                 return True
            except subprocess.CalledProcessError as e:
                return False
            except:
                return False