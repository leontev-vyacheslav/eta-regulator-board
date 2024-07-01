import logging


class EmuRegulationEngineLoggerHandler(logging.StreamHandler):
    def emit(self, record):
        try:
            msg = self.format(record)
            print(f'\r{msg}', end='', flush=True)
        except Exception:
            self.handleError(record)
