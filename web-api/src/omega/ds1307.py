from datetime import datetime
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

    def _write(self, register, data):
        # print "addr =0x%x register = 0x%x data = 0x%x %i " % (self._addr, register, data,_bcd_to_int(data))
        self._bus.write_byte_data(self._addr, register, data)

    def _read(self, data):

        returndata = self._bus.read_byte_data(self._addr, data, 1)
        return returndata

    def _read_seconds(self):
        out = bcd_to_int(self._read(self._REG_SECONDS))
        return out

    def _read_minutes(self):
        out = bcd_to_int(self._read(self._REG_MINUTES))
        return out

    def _read_hours(self):
        d = self._read(self._REG_HOURS)
        if d == 0x64:
            d = 0x40
        out = bcd_to_int(d & 0x3F)
        return out

    def _read_day(self):
        out = bcd_to_int(self._read(self._REG_DAY))
        return out

    def _read_date(self):
        out = bcd_to_int(self._read(self._REG_DATE))
        return out

    def _read_month(self):
        out = bcd_to_int(self._read(self._REG_MONTH))
        return out

    def _read_year(self):
        out = bcd_to_int(self._read(self._REG_YEAR))
        return out

    def read_all(self):
        """Return a tuple such as (year, month, date, day, hours, minutes,
        seconds).
        """
        return (self._read_year(), self._read_month(), self._read_date(),
                self._read_day(), self._read_hours(), self._read_minutes(),
                self._read_seconds())

    def read_str(self):
        """Return a string such as 'YY-DD-MMTHH-MM-SS'.
        """
        return '%02d-%02d-%02dT%02d:%02d:%02d' % (self._read_year(),
                                                  self._read_month(), self._read_date(), self._read_hours(),
                                                  self._read_minutes(), self._read_seconds())

    def read_datetime(self, century=21, tzinfo=None):
        """Return the datetime.datetime object.
        """
        return datetime(int((century - 1) * 100 + self._read_year()), int(self._read_month()), int(self._read_date()),
                        int(self._read_hours()), int(self._read_minutes()), int(self._read_seconds()), 0, tzinfo=tzinfo)

    def write_all(self, seconds=None, minutes=None, hours=None, day=None,
                  date=None, month=None, year=None, save_as_24h=True):
        """Direct write un-none value.
        Range: seconds [0,59], minutes [0,59], hours [0,23],
               day [0,7], date [1-31], month [1-12], year [0-99].
        """
        if seconds is not None:
            if seconds < 0 or seconds > 59:
                raise ValueError('Seconds is out of range [0,59].')
            self._write(self._REG_SECONDS, int_to_bcd(seconds))

        if minutes is not None:
            if minutes < 0 or minutes > 59:
                raise ValueError('Minutes is out of range [0,59].')
            self._write(self._REG_MINUTES, int_to_bcd(minutes))

        if hours is not None:
            if hours < 0 or hours > 23:
                raise ValueError('Hours is out of range [0,23].')
            self._write(self._REG_HOURS, int_to_bcd(hours))  # not | 0x40 as in the orignal code

        if year is not None:
            if year < 0 or year > 99:
                raise ValueError('Years is out of range [0,99].')
            self._write(self._REG_YEAR, int_to_bcd(year))

        if month is not None:
            if month < 1 or month > 12:
                raise ValueError('Month is out of range [1,12].')
            self._write(self._REG_MONTH, int_to_bcd(month))

        if date is not None:
            if date < 1 or date > 31:
                raise ValueError('Date is out of range [1,31].')
            self._write(self._REG_DATE, int_to_bcd(date))

        if day is not None:
            if day < 1 or day > 7:
                raise ValueError('Day is out of range [1,7].')
            self._write(self._REG_DAY, int_to_bcd(day))

    def write_datetime(self, dt):
        """Write from a datetime.datetime object.
        """
        self.write_all(dt.second, dt.minute, dt.hour,
                       dt.isoweekday(), dt.day, dt.month, dt.year % 100)

    def write_now(self):
        """Equal to DS1307.write_datetime(datetime.datetime.now()).
        """
        self.write_datetime(datetime.now())
