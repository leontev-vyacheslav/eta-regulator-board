import { createContext, useContext } from 'react';

export type HomePageContextModel = {
  //
};

const HomePageContext = createContext({} as HomePageContextModel) ;

function HomPageContextProvider (props: any) {


    return (
        <HomePageContext.Provider value={ {

        } } { ...props } />
    );
}
const useDebugPage = () => useContext(HomePageContext);

export { HomPageContextProvider, useDebugPage };