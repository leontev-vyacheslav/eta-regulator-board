from datetime import datetime
from base64 import b64decode
from Crypto.Util.Padding import unpad
from Crypto.Cipher import AES

from utils.network import get_mac_address
from app import MASTER_KEY


def decrypt(encrypted_data, key):
    encrypted_data = b64decode(encrypted_data)
    iv = encrypted_data[:AES.block_size]
    cipher_text = encrypted_data[AES.block_size:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_text = cipher.decrypt(cipher_text)
    decrypted_text = unpad(decrypted_text, 16)

    return decrypted_text.decode('utf-8')


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
