export type GpioItemModel = {
    debugModeDescription?: string | null;

    manualModeDescription?: string | null;

    pin: number;

    state: boolean;
}

export type GpioSetModel = {
    items: GpioItemModel[]
}