from hashlib import sha256
import time

print(sha256('0000'.encode(encoding='utf-8')).hexdigest())

print(time.time())