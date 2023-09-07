import os
import time


os.system("fast-gpio set-output 44")
os.system("fast-gpio set-output 17")
os.system("fast-gpio set-output 16")
n = 20
out = 0
change = 0
while 1:
    change = 0
    myCmd = "fast-gpio pwm 44 " + str(n) + " 50"
    os.system(myCmd)
    print(myCmd)

    if out == 0:
        myCmd = "fast-gpio set 16 0"
        os.system(myCmd)
        time.sleep(0.5)
        out = 1
        myCmd = "fast-gpio set 17 1"
        os.system(myCmd)
        change = 1

    if (out == 1) and (change == 0):
        myCmd = "fast-gpio set 17 0"
        os.system(myCmd)
        time.sleep(0.5)
        out = 0
        myCmd = "fast-gpio set 16 1"
        os.system(myCmd)
        change = 1

    time.sleep(240)
    n = n - 1
    if n <= 0:
        n = 20

