import Form from 'devextreme-react/form';
import { createContext, useContext, useMemo, useRef } from 'react';

export type DacContextModel = {
    dacFormRef: React.RefObject<Form>;
    testSignalList: TestSignalModel[];
};

export type TestSignalModel = {
    id: number;
    description: string
}

const DacContext = createContext({} as DacContextModel);

function DacContextProvider(props: any) {
    const dacFormRef = useRef<Form>(null);
    const testSignalList = useMemo<TestSignalModel[]>(() => [
        { id: 1, description: 'Синусоида, 100 Гц' },
        { id: 2, description: 'Пилообразный сигнал, 100 Гц' },
        { id: 3, description: 'Прямоугольный сигнал, 100 Гц' },
    ], []);

    return (
        <DacContext.Provider value={ {
            dacFormRef,
            testSignalList
        } } { ...props } />
    );
}

const useDac = () => useContext(DacContext);

export { DacContextProvider, useDac };