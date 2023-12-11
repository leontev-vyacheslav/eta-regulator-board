import { TabPanel } from 'devextreme-react';
import React, { createContext, useContext, useRef } from 'react';

export type DebugPageContextModel = {
    tabPanelRef: React.RefObject<TabPanel<any, any>>;
};

const DebugPageContext = createContext({} as DebugPageContextModel) ;

function DebugPageContextProvider (props: any) {
    const tabPanelRef = useRef<TabPanel<any, any>>(null);

    return (
        <DebugPageContext.Provider value={ {
            tabPanelRef
        } } { ...props } />
    );
}
const useDebugPage = () => useContext(DebugPageContext);

export { DebugPageContextProvider, useDebugPage };