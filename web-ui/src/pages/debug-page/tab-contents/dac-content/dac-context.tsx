import { createContext, useContext } from 'react';

export type DacContextModel = {
    //
};

const DacContext = createContext({} as DacContextModel);

function DacContexProvider(props: any) {
    return (
        <DacContext.Provider value={ {
            //
        } } { ...props } />
    );
}

const useDac = () => useContext(DacContext);

export { DacContexProvider, useDac };