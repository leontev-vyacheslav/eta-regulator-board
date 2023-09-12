import time

from omega.ds1307 import DS1307


with DS1307(0x68) as rtc:

    while True:

        try:
            start_time = time.perf_counter()
            a = rtc.read_datetime()
            end_time = time.perf_counter()
            delta1 = end_time - start_time

            print(f'{a} -> {delta1}')

        # pylint: disable=broad-except
        except Exception as ex:
            print('Error transaction...', ex)
        time.sleep(5)
