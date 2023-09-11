import sys


def is_debug() -> bool:

    return hasattr(sys, 'gettrace') and sys.gettrace() is not None
