import time
from abc import ABC
from multiprocessing import Event



class SignalGenerator(ABC):

    AMPLIFIER_GAIN = 3

    def __init__(self, event: Event) -> None:
        self._event = event

    def _sleep(self, duration) -> None:
        now = time.perf_counter()
        end = now + duration
        while now < end:
            now = time.perf_counter()

    def generate(self, channel: int, freq: int, amplitude: float) -> None:
        pass
