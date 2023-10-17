import { Dispatch, createContext, useContext, useEffect, useState } from 'react'
import { GpioSetModel } from '../../../../models/regulator-settings/gpio-set-model';
import { useGpioData } from '../../../../contexts/app-data/use-gpio-data';

export type GpioTabContextModel = {
    gpioSet: GpioSetModel | null,
    setGpioSet: Dispatch<React.SetStateAction<GpioSetModel | null | undefined>>
};

const GpioTabContext = createContext({} as GpioTabContextModel);

function GpioTabContextProvider(props: any) {
    const [gpioSet, setGpioSet] = useState<GpioSetModel | null>();
    const { getGpioAllAsync } = useGpioData();

    useEffect(() => {
        (async () => {
            const gpioSet = await getGpioAllAsync();
            setGpioSet(gpioSet);
        })();
    }, [getGpioAllAsync]);

    return (
        <GpioTabContext.Provider value={ {
            gpioSet,
            setGpioSet
        } } { ...props }>
            {props.children}
        </GpioTabContext.Provider>
    );
}
const useGpioTabContext = () => useContext(GpioTabContext);

export { GpioTabContextProvider, useGpioTabContext }