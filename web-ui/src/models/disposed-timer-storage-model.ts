export type DisposedTimersStorageModel = {
    areas: DisposedTimersStorageAreaModel[]
}

export type DisposedTimerModel = {
    uuid: string;
    timer: ReturnType<typeof setInterval>;
}

export type DisposedTimersStorageAreaModel = {
    name: string;
    items: DisposedTimerModel[]
}