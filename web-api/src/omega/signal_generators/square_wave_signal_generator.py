import time
from omega import gpio
from omega.mcp4922 import MCP4922
from omega.signal_generators.signal_generator import SignalGenerator


class SquareWaveSignalGenerator(SignalGenerator):

    def generate(self, channel: int, freq: int, amplitude: float) -> None:
        period = 1 / freq
        samples = 100
        t = 0.0
        step = period / samples
        dt = step
        scope = MCP4922.FULL_RANGE * (amplitude / (MCP4922.REFERENCE_VOLTAGE * SignalGenerator.AMPLIFIER_GAIN))

        gpio.dac_chip_select()

        with MCP4922() as dac:
            while True:
                s = time.perf_counter()

                if self._event.is_set():
                    break

                if t < period / 2:
                    value = scope
                else:
                    value = 0

                dac.write(channel, int(value))
                t += step

                if t > period:
                    t = 0.0

                e = time.perf_counter()
                self._sleep((dt - (e - s)) / 30)
