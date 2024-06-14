import os
import sys


def is_debug() -> bool:

    return hasattr(sys, 'gettrace') and sys.gettrace() is not None or 'PYTEST_CURRENT_TEST' in os.environ
