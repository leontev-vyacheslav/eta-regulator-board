import { Dispatch, createContext, useContext, useEffect, useState } from 'react'
import { GpioSetModel } from '../../models/regulator-settings/gpio-set-model';
import { useGpioData } from '../../contexts/app-data/use-gpio-data';

export type GpioPageContextModel = {
    gpioSet: GpioSetModel | null,
    setGpioSet: Dispatch<React.SetStateAction<GpioSetModel | null | undefined>>
};

const GpioPageContext = createContext({} as GpioPageContextModel);

function GpioPageContextProvider(props: any) {
    const [gpioSet, setGpioSet] = useState<GpioSetModel | null>();
    const { getGpioAllAsync } = useGpioData();

    useEffect(() => {
        (async () => {
            const gpioSet = await getGpioAllAsync();
            setGpioSet(gpioSet);
        })();
    }, [getGpioAllAsync]);

    return (
        <GpioPageContext.Provider value={ {
            gpioSet,
            setGpioSet
        } } { ...props }>
            {props.children}
        </GpioPageContext.Provider>
    );
}
const useGpioPageContext = () => useContext(GpioPageContext);

export { GpioPageContextProvider, useGpioPageContext }