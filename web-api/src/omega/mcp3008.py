#pylint: disable=no-name-in-module
from spidev import SpiDev


class MCP3008:

    def __init__(self) -> None:
        self._bus = SpiDev()
        self._bus.open(0, 1)
        self._bus.max_speed_hz = 1000000

        self._command = [0] * 2
        self._bitDepth = 10
        self._fullADC = 2 ** self._bitDepth - 1

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self._bus.close()

    def read_all(self):
        adcVal = [0] * 8
        vltVal = [0] * 8
        tmpVal = [0] * 8

        channel = 0

        while channel < 8:
            # start bit
            self._command[0] = 0x01
            # configuration
            self._command[1] = 0x80 | (channel << 4)

            v = self._bus.xfer3(self._command, 3)
            adcVal[channel] = 0x3FF & ((v[1] & 0x01) << 8 | (v[0] & 0xFF) | (v[2] & 0x80) << 2)

            vltVal[channel] = adcVal[channel] / self._fullADC * 3.3

            if vltVal[channel] == 0:
                tmpVal[channel] = 1000000
            else:
                tmpVal[channel] = (973 * 3.3 / vltVal[channel] - 973 - 1000) / 3.9

            channel += 1

        return vltVal
