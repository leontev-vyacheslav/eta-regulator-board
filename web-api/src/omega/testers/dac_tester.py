
import math
import time

from omega import gpio
from omega.mcp4922 import MCP4922


with MCP4922() as mcp_4922:
    iterator = 0
    channel = 0

    while True:
        value = (math.sin(iterator) + 1) * (MCP4922.FULL_RANGE // 2) / 1.3

        gpio.dac_chip_select()
        mcp_4922.write(channel=channel, value=int(value))

        iterator += 0.1

        if iterator >= 6.28:
            iterator = 0

        time.sleep(0.001)
