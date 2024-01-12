from hashlib import sha256

print(sha256('0000'.encode(encoding='utf-8')).hexdigest())