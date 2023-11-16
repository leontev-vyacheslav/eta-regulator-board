import subprocess
from typing import List

GPIO_Vp = 19
CSGPIO = 18
CS1 = 6

def set(pin: int, state: bool) -> bool:

    completed_process = subprocess.run(
        ['fast-gpio',
         'set',
         f'{pin}',
         f'{int(state)}'],
        check=True,
        stdout=subprocess.PIPE,
        universal_newlines=True
    )

    if completed_process.returncode != int():
        raise Exception

    stdout = completed_process.stdout
    value = stdout.replace(f'> Set GPIO{pin}: ', str())[0]

    return bool(int(value))


def get(pin: int) -> bool:
    completed_process = subprocess.run(
        ['fast-gpio',
         'read',
         f'{pin}'],
        check=True,
        stdout=subprocess.PIPE,
        universal_newlines=True
    )

    if completed_process.returncode != 0:
        raise Exception

    stdout = completed_process.stdout
    value = stdout.replace(f'> Read GPIO{pin}: ', str())[0]

    return bool(int(value))


def get_all(pins: List[int]) -> List[bool]:

    return [get(p) for p in pins]


def adc_chip_select():
    set(CS1, False)
    set(CSGPIO, False)


def dac_chip_select():
    set(CS1, False)
    set(CSGPIO, True)
