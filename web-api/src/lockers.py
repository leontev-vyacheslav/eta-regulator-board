from typing import Dict
from multiprocessing import Lock as ProcessLock
from threading import Lock as ThreadLock

hardware_process_lock = ProcessLock()
hardware_process_rtc_lock = ProcessLock()

worker_thread_locks: Dict[str, ThreadLock] = {}
