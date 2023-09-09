import time

from omega.ds1307 import DS1307


with DS1307(0x68) as rtc:

    while True:
        a = 0
        # rtc.write_all(0,59,21,3,11,7,23)
        try:
            a = rtc.read_datetime()
        except:
            print("Error transaction...")
        finally:
            print(a)

        time.sleep(5)
