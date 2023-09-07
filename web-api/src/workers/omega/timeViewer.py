import time
import ds1307
from OmegaExpansion import onionI2C

rtc = ds1307.DS1307(0x68)

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