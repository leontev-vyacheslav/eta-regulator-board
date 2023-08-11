import time
import spidev
import math

DAC_MODEL = 4921 # or 4922

spi = spidev.SpiDev()
spi.open(0, 1)
spi.max_speed_hz = 1000000
print('Max speed = ' + str(spi.max_speed_hz) + 'Hz')
print('SPI mode = ' + str(spi.mode))
print('Bit per word = ' + str(spi.bits_per_word))

DAC_1 = 0
DAC_2 = 0
iterator = 0
command = [0] * 2
chFl = 0
dac_ch_1 = 0x00 << 7
dac_ch_2 = 0x01 << 7
while 1:
    # to channel 1
    command[0] = dac_ch_1 | 0x00 | (0x01 << 5) | (0x01 << 4) | (DAC_1 >> 8)
    command[1] = DAC_1 & 0xFF

    spi.xfer3(command, 0)

    # to channel 2
    command[0] = dac_ch_2 | 0x00 | (0x01 << 5) | (0x01 << 4) | (int(DAC_2) >> 8)
    command[1] = int(DAC_2) & 0xFF

    spi.xfer3(command, 0)

    if chFl == 0:
        DAC_1 += 1
    else:
        DAC_1 -= 1

    if DAC_1 >= 4095:
        chFl = 1

    if DAC_1 <= 0:
        chFl = 0

    DAC_2 = (math.sin(iterator) + 1) * 2047 / 1.3
    iterator += 0.001

    if iterator >= 6.28:
        iterator = 0

    # vlt = DAC_1 / 4095 * 3.3
    # print("DAC_1 voltage = " + str(vlt))
    # vlt = DAC_2 / 4095 * 3.3
    # print("DAC_2 voltage = " + str(vlt))

    time.sleep(0.0001)