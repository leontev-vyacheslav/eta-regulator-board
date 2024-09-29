import os
import logging
from datetime import datetime

class DefaultLoggingFormatter(logging.Formatter):
    def format(self, record):
        record.pid = os.getpid()
        record.created_utc = datetime.utcfromtimestamp(record.created)
        record.utctime = record.created_utc.strftime("%Y-%m-%d %H:%M:%S.%f%z")[:-4] + " +0000"

        return super().format(record)
