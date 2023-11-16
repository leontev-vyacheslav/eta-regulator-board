#pylint: disable=no-name-in-module
from spidev import SpiDev


class MCP3208:
    BIT_DEPTH: int = 12
    FULL_RANGE: int = 2 ** BIT_DEPTH - 1
    SPI_MAX_SPEED: int = 1000000
    REFERENCE_VOLTAGE: float = 3.3
    CHANNEL_AMOUNT: int = 8


    def __init__(self) -> None:
        self._bus = SpiDev()
        self._bus.open(0, 1)
        self._bus.max_speed_hz = MCP3208.SPI_MAX_SPEED
        self._command = [0] * 2

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self._bus.close()

    def read(self, channel: int) -> float:

        if channel < 0 or channel > MCP3208.CHANNEL_AMOUNT - 1:
            raise ValueError(f'{MCP3208.__name__} channel must be in range 0-{MCP3208.CHANNEL_AMOUNT - 1}, but it was appointed {channel}.')

        self._command[0] = 0x06 | ((channel >> 2) & 0x01)
        self._command[1] = (channel & 0x03) << 6

        raw_value = self._bus.xfer3(self._command, 3)

        adc_value = 0xFFF & (((raw_value[1] & 0x01) << 8) |
                         (raw_value[0] & 0xFF) |
                         ((raw_value[2] & 0x80) << 2) |
                         ((raw_value[2] & 0x40) << 4) |
                         ((raw_value[2] & 0x20) << 6))

        voltage_value = (MCP3208.REFERENCE_VOLTAGE * adc_value) / MCP3208.FULL_RANGE

        return voltage_value

    def read_avg(self, channel: int, measurements: int = 10):

        if 50 < measurements < 1:
            raise ValueError ('The number of measurement series must be greater than 0.')

        series_counter: int = measurements
        accumulator: float = float()

        while series_counter > 0:
            current_value = self.read(channel)
            accumulator += current_value
            series_counter -= 1

        return accumulator / measurements
