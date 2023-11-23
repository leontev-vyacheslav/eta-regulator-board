import math
import time
from omega import gpio

from omega.mcp4922 import MCP4922


class SignalGenerator:

    AMPLIFIER_GAIN = 3

    @staticmethod
    def _sleep(duration):
        now = time.perf_counter()
        end = now + duration
        while now < end:
            now = time.perf_counter()


    @staticmethod
    def sin(channel: int, freq: int, amplitude: float):

        period = 1 / freq
        samples = 100
        t = 0.0
        step = 2 * math.pi / samples
        dt = (period / samples)

        #start_time = time.perf_counter()
        k = (MCP4922.FULL_RANGE // 2) * (amplitude / (MCP4922.REFERENCE_VOLTAGE * SignalGenerator.AMPLIFIER_GAIN))
        gpio.dac_chip_select()

        with MCP4922() as dac:
            while True:
                s = time.perf_counter()
                value = (math.sin(t) + 1) * k
                dac.write(channel, int(value))
                t += step

                if t > 2 * math.pi:
                    t = 0.0
                    #break
                e = time.perf_counter()
                SignalGenerator._sleep((dt - (e - s)) / 30 )

        # print(time.perf_counter() - start_time)



SignalGenerator.sin(0, 100, 9.9)
