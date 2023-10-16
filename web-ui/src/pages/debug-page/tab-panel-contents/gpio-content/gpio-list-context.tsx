import { Dispatch, createContext, useContext, useEffect, useState } from 'react'
import { GpioSetModel } from '../../../../models/regulator-settings/gpio-set-model';
import { useGpioData } from '../../../../contexts/app-data/use-gpio-data';

export type GpioListContextModel = {
    gpioSet: GpioSetModel | null,
    setGpioSet: Dispatch<React.SetStateAction<GpioSetModel | null | undefined>>
};

const GpioListContext = createContext({} as GpioListContextModel);

function GpioListContextProvider(props: any) {
    const [gpioSet, setGpioSet] = useState<GpioSetModel | null>();
    const { getGpioAllAsync } = useGpioData();

    useEffect(() => {
        (async () => {
            const gpioSet = await getGpioAllAsync();
            setGpioSet(gpioSet);
        })();
    }, [getGpioAllAsync]);

    return (
        <GpioListContext.Provider value={ {
            gpioSet,
            setGpioSet
        } } { ...props }>
            {props.children}
        </GpioListContext.Provider>
    );
}
const useGpioListContext = () => useContext(GpioListContext);

export { GpioListContextProvider, useGpioListContext }