def bcd_to_int(bcd):
    out = 0
    for d in (bcd >> 4, bcd):
        for p in (1, 2, 4, 8):
            if d & 1:
                out += int(p)
            d >>= 1
        out = int(out) * 10
    out = int(out / 10)

    return out


def int_to_bcd(n):
    bcd = 0
    for i in (n // 10, n % 10):
        for p in (8, 4, 2, 1):
            if i >= p:
                bcd += 1
                i -= p
            bcd <<= 1

    return bcd >> 1


def adc_value_to_temperature(value: float) -> float:
    return (973 * 3.3 / value - 973 - 1000) / 3.9
