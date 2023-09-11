import time

from omega.ds1307 import DS1307


with DS1307(0x68) as rtc:

    while True:
        a = 0
        # rtc.write_all(0,59,21,3,11,7,23)
        # rtc.write_datetime(datetime.now() + timedelta(hours=5))
        try:
            a = rtc.read_datetime()
        # pylint: disable=broad-except
        except Exception as ex:
            print("Error transaction...", ex)
        finally:
            print(a)

        time.sleep(5)
