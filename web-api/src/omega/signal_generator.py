import math
import time
from abc import ABC
from multiprocessing import Event

from omega import gpio
from omega.mcp4922 import MCP4922


class SignalGenerator(ABC):

    AMPLIFIER_GAIN = 3

    def __init__(self, event: Event) -> None:
        self._event = event

    def _sleep(self, duration) -> None:
        now = time.perf_counter()
        end = now + duration
        while now < end:
            now = time.perf_counter()


class SinSignalGenerator(SignalGenerator):

    def generate(self, channel: int, freq: int, amplitude: float) -> None:

        period = 1 / freq
        samples = 100
        t = 0.0
        step = 2 * math.pi / samples
        dt = (period / samples)

        k = (MCP4922.FULL_RANGE // 2) * (amplitude / (MCP4922.REFERENCE_VOLTAGE * SignalGenerator.AMPLIFIER_GAIN))
        gpio.dac_chip_select()

        with MCP4922() as dac:
            while True:
                s = time.perf_counter()

                if self._event.is_set():
                    break

                value = (math.sin(t) + 1) * k
                dac.write(channel, int(value))
                t += step

                if t > 2 * math.pi:
                    t = 0.0

                e = time.perf_counter()
                self._sleep((dt - (e - s)) / 30)
