from datetime import datetime
from base64 import b64decode
from pyaes import AESModeOfOperationCBC

from utils.network import get_mac_address
from app import MASTER_KEY

BLOCK_SIZE = 16


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


def verify_access_token(access_token: str) -> bool:
    try:
        token_parts = decrypt(access_token, b64decode(MASTER_KEY)).split('->')
        mac_address = get_mac_address('eth0')

        if mac_address is not None:
            decrypted_mac_address = token_parts[0]
            expiration_datetime = datetime.strptime(token_parts[1], '%Y-%m-%dT%H:%M:%S.%fZ')
    except:
        return False

    return mac_address == decrypted_mac_address and expiration_datetime > datetime.now()
