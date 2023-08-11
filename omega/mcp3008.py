import time
import spidev
import math

ADC_MODEL = 3208 # or 3008

spi = spidev.SpiDev()
spi.open(0, 1)
spi.max_speed_hz = 1000000
print('Max speed = ' + str(spi.max_speed_hz) + 'Hz')
print('SPI mode = ' + str(spi.mode))
print('Bit per word = ' + str(spi.bits_per_word))

while 1:
    n = 0
    fullADC = 0
    adcVal = [0] * 8
    vltVal = [0] * 8
    tmpVal = [0] * 8
    while n < 8:
        command = [0] * 2

        if ADC_MODEL == 3008:
            fullADC = 1023
            command[0] = 0x01                      #3008
            command[1] = 0x80 | (n << 4)           #3008

        if ADC_MODEL == 3208:
            fullADC = 4095
            command[0] = 0x06 | ((n >> 2) & 0x01)   #3208
            command[1] = (n & 0x03) << 6            #3208

        v = spi.xfer3(command, 3)
        print("<- " + str(v))

        if ADC_MODEL == 3008:
            adcVal[n] = 0x3FF & ((v[1] & 0x01) << 8 | (v[0] & 0xFF) | (v[2] & 0x80) << 2)

        if ADC_MODEL == 3208:
            adcVal[n] = 0xFFF & (((v[1] & 0x01) << 8) | (v[0] & 0xFF) | ((v[2] & 0x80) << 2) | ((v[2] & 0x40) << 4) | ((v[2] & 0x20) << 6))

        vltVal[n] = adcVal[n] / fullADC * 3.3
        # tmpVal[n] = (adcVal[n] / fullADC * 3.3) / 2 * 0.0018
        if vltVal[n] == 0:
            tmpVal[n] = 1000000
        else:
            tmpVal[n] = (973 * 3.3 / vltVal[n] - 973 - 1000) / 3.9

        n += 1


    print('Val ADC(0-7): ' + str(adcVal))
    print('Val VLT(0-7): ' + str(vltVal))
    print('Val TMP(0-7): ' + str(tmpVal))

    time.sleep(3)

while 1:

    readVals = spi.xfer([0x01, 0x80, 0x00])

    #readVals = [0, 1, 2]
    #readVals = spi.xfer3([0xC0, 0x00, 0x00], 3)

    print('readVal: ' + str(readVals))
    b0 = readVals[0]
    b1 = readVals[1]
    b2 = readVals[2]

    readVals = 0x3FF & ((b0 & 0x01) << 9 | (b1 & 0xFF) << 1 | (b2 & 0x80) >> 7)

    print('Val ADC: ' + str(readVals))

    time.sleep(5)