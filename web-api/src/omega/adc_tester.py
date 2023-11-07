from omega import gpio
from omega.mcp3208 import MCP3208

gpio.adc_chip_select()

with MCP3208(reference_voltage=3.3) as mcp_3208:
    avg_value = mcp_3208.read_avg(
        channel=0,
        measurements=20
    )

print(avg_value)
