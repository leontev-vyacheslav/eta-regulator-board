import os
from base64 import b64decode, b64encode
from datetime import datetime, timedelta
from typing import Optional

from pyaes import AESModeOfOperationCBC
master_key = 'XAMhI3XWj+PaXP5nRQ+nNpEn9DKyHPTVa95i89UZL6o='

BLOCK_SIZE = 16

def create_master_key():
    return b64encode(os.urandom(32)).decode('utf-8')

# print(create_master_key())



def get_mac_adderss(interface: str) -> Optional[str]:
    try:
        with open(f'/sys/class/net/{interface}/address', encoding='utf-8') as f:
            mac = f.readline()
    except:
        return None

    return mac[0:17]


def encrypt(plain_text: str, key):
    plain_text = plain_text.ljust(len(plain_text) + (BLOCK_SIZE - len(plain_text) % BLOCK_SIZE) % BLOCK_SIZE, '\0')
    iv = os.urandom(BLOCK_SIZE)
    aes = AESModeOfOperationCBC(key, iv)
    buffer = plain_text.encode('utf-8')
    blocks_count = len(buffer) // BLOCK_SIZE
    cipher_text = b''
    for i in range(blocks_count):
        block = buffer[i * BLOCK_SIZE:i * BLOCK_SIZE + BLOCK_SIZE]
        cipher_text += aes.encrypt(block)

    cipher_text = iv + cipher_text

    return b64encode(cipher_text).decode('utf-8')


def decrypt(encrypted_data, key: bytes):
    encrypted_data = b64decode(encrypted_data)

    iv = encrypted_data[0:BLOCK_SIZE]
    encrypted_data = encrypted_data[BLOCK_SIZE:]

    aes = AESModeOfOperationCBC(key, iv)
    blocks_count = len(encrypted_data) // BLOCK_SIZE
    plain_text = b''
    for i in range(blocks_count):
        block = encrypted_data[i * 16:i * 16 + 16]
        plain_text += aes.decrypt(block)

    return plain_text.decode('utf-8').rstrip('\0')


def create_access_token(mac_adderss: str, duration: int, key: str) -> str:
    expiration_datetime = datetime.now() + timedelta(hours=duration)

    return encrypt(f'{mac_adderss}->{expiration_datetime.isoformat()}Z', b64decode(key))


def verify_access_token(access_token: str) -> bool:
    token_parts = decrypt(access_token, b64decode(master_key)).split('->')
    mac_address = get_mac_adderss('eth0')
    decripted_mac_address = token_parts[0]
    expiration_datetime = datetime.strptime(token_parts[1], '%Y-%m-%dT%H:%M:%S.%fZ')

    return mac_address == decripted_mac_address and expiration_datetime > datetime.now()

plain_text = 'Hello Wwefwefwefwef werfwerfwerfwe '

encrypted_text = encrypt(plain_text, b64decode(master_key))
decrypted_text = decrypt(encrypted_text, b64decode(master_key))

print(decrypted_text == plain_text)


mac_address = get_mac_adderss('eth0')
mac_address = '40:a3:6b:c9:8f:7a'

c = create_access_token(mac_address, 8, master_key)
print(c)
print(verify_access_token(c))

