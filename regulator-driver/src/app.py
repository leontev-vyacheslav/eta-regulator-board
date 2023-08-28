import argparse
from threading import Thread, get_ident
from time import sleep

parser = argparse.ArgumentParser()
parser.add_argument("-i1", "--interval1", type=int, default=10)
parser.add_argument("-i2", "--interval2", type=int, default=5)

args = parser.parse_args()
interval1 = args.interval1
interval2 = args.interval2


def background_task(interval_sec, message):

    while True:
        sleep(interval_sec)
        # perform the task
        print(message, get_ident())


daemon1 = Thread(target=background_task, args=(interval1, 'Task1 thread will do its work!'), daemon=True)
daemon1.start()

daemon2 = Thread(target=background_task, args=(interval2, 'Task2 thread will do its work!'), daemon=True)
daemon2.start()


while True:
    sleep(1)
    print('Main thread will do its work!')
