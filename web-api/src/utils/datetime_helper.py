from datetime import datetime, timedelta


def get_last_day_of_month(any_day: datetime):
    # The day 28 exists in every month. 4 days later, it's always next month
    next_month = any_day.replace(day=28) + timedelta(days=4)

    # subtracting the number of the current day brings us back one month
    return next_month - timedelta(days=next_month.day)


def is_last_day_of_month(any_day: datetime):
    last_date = get_last_day_of_month(any_day)

    return last_date.day == any_day.day
