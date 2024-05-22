from itertools import count, takewhile


def frange(start: float, stop: float, step: float):
    return takewhile(lambda x: x < stop, count(start, step))
