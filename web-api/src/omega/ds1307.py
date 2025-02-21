from datetime import datetime, timezone
from smbus2 import SMBus

from omega.decoders import bcd_to_int, int_to_bcd

class DS1307:
    _REG_SECONDS = 0x00
    _REG_MINUTES = 0x01
    _REG_HOURS = 0x02
    _REG_DAY = 0x03
    _REG_DATE = 0x04
    _REG_MONTH = 0x05
    _REG_YEAR = 0x06
    _REG_CONTROL = 0x07

    def __init__(self, addr=0x68):
        self._bus = SMBus(0)
        self._addr = addr

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self._bus.close()


    def read_datetime(self, century=21):
        block = self._bus.read_i2c_block_data(self._addr, self._REG_SECONDS, self._REG_CONTROL)

        seconds = bcd_to_int(block[self._REG_SECONDS])
        minutes = bcd_to_int(block[self._REG_MINUTES])

        raw_hours = block[self._REG_HOURS]
        if raw_hours == 0x64:
            raw_hours = 0x40
        hours = bcd_to_int(raw_hours & 0x3F)

        date = bcd_to_int(block[self._REG_DATE])
        month = bcd_to_int(block[self._REG_MONTH])

        year = bcd_to_int(block[self._REG_YEAR])

        return datetime(
            year=(century - 1) * 100 + year,
            month=month,
            day=date,
            hour=hours,
            minute=minutes,
            second=seconds,
            tzinfo=timezone.utc,
        )

    def write_datetime(self, dt: datetime):

        self._bus.write_i2c_block_data(
            self._addr,
            self._REG_SECONDS,
            data=[
                    int_to_bcd(dt.second),
                    int_to_bcd(dt.minute),
                    int_to_bcd(dt.hour),
                    int_to_bcd(dt.isoweekday()),
                    int_to_bcd(dt.day),
                    int_to_bcd(dt.month),
                    int_to_bcd(dt.year % 100)
            ]
        )
