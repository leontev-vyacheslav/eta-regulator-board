import { TabPanel } from 'devextreme-react';
import React, { createContext, useContext, useRef } from 'react';

export type DebugPageContexModel = {
    tabPanelRef: React.RefObject<TabPanel<any, any>>;
};

const DebugPageContex = createContext({} as DebugPageContexModel) ;

function DebugPageContextProvider (props: any) {
    const tabPanelRef = useRef<TabPanel<any, any>>(null)
    return (
        <DebugPageContex.Provider value={ {
            tabPanelRef
        } } { ...props } />
    );
}
const useDebugPage = () => useContext(DebugPageContex);

export { DebugPageContextProvider, useDebugPage };