from threading import Thread, Lock, current_thread
from queue import Queue


def worker(queue: Queue, lock: Lock):
    while True:
        value = queue.get()

        print(f'{current_thread().name} got {value}')
        queue.task_done()


if __name__ == "__main__":
    main_queue = Queue()
    lock = Lock()

    num_threads = 10

    for i in range(num_threads):
        thread = Thread(target=worker, daemon=True, args=(main_queue, lock))
        thread.start()

    for i in range(1, 21):
        main_queue.put(i)

    main_queue.join()

    print("end main")
