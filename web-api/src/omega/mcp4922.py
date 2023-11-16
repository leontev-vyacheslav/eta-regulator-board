#pylint: disable=no-name-in-module
from spidev import SpiDev

class MCP4922 :
    BIT_DEPTH: int = 12
    FULL_RANGE: int = 2 ** BIT_DEPTH - 1
    SPI_MAX_SPEED: int = 1000000
    REFERENCE_VOLTAGE: float = 3.3
    CHANNEL_AMOUNT: int = 2

    def __init__(self) -> None:
        self._bus = SpiDev()
        self._bus.open(0, 1)
        self._bus.max_speed_hz = MCP4922.SPI_MAX_SPEED
        self._command = [0] * 2

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self._bus.close()

    def write(self, channel: int, value: int):
        if channel < 0 or channel > MCP4922.CHANNEL_AMOUNT - 1:
            raise ValueError(f'{MCP4922.__name__} channel must be in range 0-{MCP4922.CHANNEL_AMOUNT - 1}, but it was appointed {channel}.')

        output = 0x3000 if channel == 0 else 0xb000

        output |= value
        self._command[0] = (output >> 8) & 0xff
        self._command[1] = output & 0xff

        self._bus.xfer3(self._command, 0)
