from threading import Thread, Lock
import time


counter = 1


def increase(lock: Lock):
    global counter

    with lock:
        local_counter = counter
        local_counter += 1
        time.sleep(1)
        counter = local_counter


if __name__ == "__main__":
    print('start value', counter)
    lock =Lock()
    thread1 = Thread(target=increase, args=(lock, ))
    theread2 = Thread(target=increase, args=(lock, ))

    thread1.start()
    theread2.start()

    thread1.join()
    theread2.join()

    print('end value', counter)
