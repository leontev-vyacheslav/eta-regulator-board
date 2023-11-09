from omega import gpio
from omega.mcp3208 import MCP3208


gpio.adc_chip_select()
gpio.set(19, True)

with MCP3208() as mcp_3208:
    avg_value = mcp_3208.read_avg(
        channel=2,
        measurements=20
    )
gpio.set(19, False)
print(avg_value, (973 * 3.3 / avg_value - 973 - 1000) / 3.9)
