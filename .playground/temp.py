from datetime import datetime, timedelta
start_current_hour_template  = {'minute': 1, 'second': 0, 'microsecond': 0}
end_current_hour_template = {'minute': 59, 'second': 59, 'microsecond': 0}

print(datetime.now().replace(**start_current_hour_template))
print(datetime.now().replace(**end_current_hour_template))

def is_last_day_of_month(any_day: datetime, day: int):
    # The day 28 exists in every month. 4 days later, it's always next month
    next_month = any_day.replace(day=28) + timedelta(days=4)
    # subtracting the number of the current day brings us back one month
    return (next_month - timedelta(days=next_month.day)).day == day

print(is_last_day_of_month(datetime.now(), 30))
a = "HEATING__0__2024-07-02T00_00_00Z.json.gz".rfind("__") + 2

print("HEATING__0__2024-07-02T00_00_00Z.json.gz"[a:])

value = 1
t = (973 * 3.3 / value - 973 - 1000) / 3.9
print(t)

print(float("inf"))