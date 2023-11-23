import math
from multiprocessing import Event
import time
from omega import gpio

from omega.mcp4922 import MCP4922


class SignalGenerator:

    AMPLIFIER_GAIN = 3

    def __init__(self, event: Event) -> None:
        self._event = event

    @staticmethod
    def _sleep(duration):
        now = time.perf_counter()
        end = now + duration
        while now < end:
            now = time.perf_counter()


    def sin(self, channel: int, freq: int, amplitude: float):

        period = 1 / freq
        samples = 100
        t = 0.0
        step = 2 * math.pi / samples
        dt = (period / samples)

        k = (MCP4922.FULL_RANGE // 2) * (amplitude / (MCP4922.REFERENCE_VOLTAGE * SignalGenerator.AMPLIFIER_GAIN))
        gpio.dac_chip_select()

        with MCP4922() as dac:
            while True:
                if self._event.is_set():
                    break

                s = time.perf_counter()
                value = (math.sin(t) + 1) * k
                dac.write(channel, int(value))
                t += step

                if t > 2 * math.pi:
                    t = 0.0
                    #break
                e = time.perf_counter()
                SignalGenerator._sleep((dt - (e - s)) / 30 )
