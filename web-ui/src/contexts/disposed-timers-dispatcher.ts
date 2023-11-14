import { DisposedTimerModel, DisposedTimersStorageAreaModel, DisposedTimersStorageModel } from '../models/disposed-timer-storage-model';

export class DisposedTimersDispatcher {

    storage: DisposedTimersStorageModel;

    constructor() {
        this.storage = {
            areas: []
        } as DisposedTimersStorageModel;
    }

    initArea (areaName: string) {
        this.clearArea(areaName);

        this.storage.areas.push(
            {
                name: areaName,
                items: []
            } as DisposedTimersStorageAreaModel
        );
    }

    clearArea(areaName: string) {
        const index = this.storage.areas.findIndex(a => a.name === areaName);
        const area = this.storage.areas[index];

        if (area) {
            area.items.forEach(t => {
                if (t.intervalTimer) {
                    clearInterval(t.intervalTimer);
                } else {
                    if (!t.timeoutTimerCancellationToken) {
                        t.timeoutTimerCancellationToken = true;
                    }
                }
            })
        }
        this.storage.areas.splice(index, 1);
    }

    add (areaName: string, disposedTimer: DisposedTimerModel) {
        const area = this.storage.areas.find(a => a.name === areaName);
        if (area) {
            area.items.push(disposedTimer)
        }
    }

    remove (areaName: string, uuid: string) {
        const area = this.storage.areas.find(a => a.name === areaName);
        if (area) {
            const disposedTimer = area.items.find(t => t.uuid === uuid);
            if(disposedTimer) {
                if(disposedTimer.intervalTimer) {
                    clearInterval(disposedTimer.intervalTimer);
                } else {
                    if (!disposedTimer.timeoutTimerCancellationToken) {
                        disposedTimer.timeoutTimerCancellationToken = true;
                    }
                }
            }
        }
    }
}