from typing import Optional


def get_mac_address(interface: str) -> Optional[str]:
    try:

        with open(f'/sys/class/net/{interface}/address', encoding='utf-8') as f:
            mac = f.readline()
    except:
        return None

    return mac[0:17]
