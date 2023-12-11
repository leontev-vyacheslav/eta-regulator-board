export enum HeatingCircuitTypeModel {
    heating = 1,
    hotWater = 2,
    ventilation = 3
}

export type HeatingCircuitTypesItem = {
    id: HeatingCircuitTypeModel;
    description: string;
    shotDescription: string;
    settings: {
        comfortTemperatureMin?: number;
        comfortTemperatureMax?: number;

        economicalTemperatureMin?: number;
        economicalTemperatureMax?: number;

        manualControlModeTemperatureSetpointMin?: number;
        manualControlModeTemperatureSetpointMax?: number;

        analogValveErrorSetpointMin?: number;
        analogValveErrorSetpointMax?: number;
    }
}

export const HeatingCircuitTypes = [
    {
        id: HeatingCircuitTypeModel.heating,
        description: 'Отопление',
        shotDescription: 'ЦО',
        settings: {
            comfortTemperatureMin: 15,
            comfortTemperatureMax: 30,

            economicalTemperatureMin: 15,
            economicalTemperatureMax: 30,

            manualControlModeTemperatureSetpointMin: 30,
            manualControlModeTemperatureSetpointMax: 150,

            analogValveErrorSetpointMin: 0,
            analogValveErrorSetpointMax: 100
        }
    },
    {
        id: HeatingCircuitTypeModel.hotWater,
        description: 'Горячее водоснабжение',
        shotDescription: 'ГВС',
        settings: {
            comfortTemperatureMin: 30,
            comfortTemperatureMax: 80,

            economicalTemperatureMin: 30,
            economicalTemperatureMax: 80,

            analogValveErrorSetpointMin: 0,
            analogValveErrorSetpointMax: 100
        }
    },
    {
        id: HeatingCircuitTypeModel.ventilation,
        description: 'Вентиляция',
        shotDescription: 'ВЕНТ',
        settings: {
            comfortTemperatureMin: 30,
            comfortTemperatureMax: 150,

            economicalTemperatureMin: 30,
            economicalTemperatureMax: 150,

            manualControlModeTemperatureSetpointMin: 40,
            manualControlModeTemperatureSetpointMax: 110,

            analogValveErrorSetpointMin: 0,
            analogValveErrorSetpointMax: 100
        }
    }
]