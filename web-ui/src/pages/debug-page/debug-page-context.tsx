import { TabPanel } from 'devextreme-react';
import React, { createContext, useContext, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

export type DebugPageContextModel = {
    tabPanelRef: React.RefObject<TabPanel<any, any>>;
    modeId: number;
};

const DebugPageContext = createContext({} as DebugPageContextModel) ;

function DebugPageContextProvider (props: any) {
    const { modeIdParam } = useParams();

    const tabPanelRef = useRef<TabPanel<any, any>>(null);

    const modeId = useMemo(() => {
        return modeIdParam ? parseInt(modeIdParam) : 1
    }, [modeIdParam]);

    return (
        <DebugPageContext.Provider value={ {
            tabPanelRef,
            modeId
        } } { ...props } />
    );
}
const useDebugPage = () => useContext(DebugPageContext);

export { DebugPageContextProvider, useDebugPage };