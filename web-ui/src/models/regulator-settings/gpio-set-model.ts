export type GpioItemModel = {
    description?: string | null;

    pin: number;

    state: boolean;
}

export type GpioSetModel = {
    items: GpioItemModel[]
}