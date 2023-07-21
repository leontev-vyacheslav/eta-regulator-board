import { createContext, useContext } from 'react';
import { AppDataContextTestEndpointsModel, useTestData } from './app-data-context/use-test-data';
 
export type AppDataContextModel = AppDataContextTestEndpointsModel;

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);

function AppDataContextProvider(props: any) {

  const testEndpoints = useTestData();

  return (
    <AppDataContext.Provider
      value={{
        ...testEndpoints
      }}
      {...props}
    />
  );
}

const useAppDataContext = () => useContext(AppDataContext);

export { AppDataContextProvider, useAppDataContext };