import subprocess


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
