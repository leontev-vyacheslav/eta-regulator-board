import { createContext, Dispatch, useContext, useState } from 'react';

export type HomePageContextModel = {
  isShowMnemoschema: boolean;
  setIsShowMnemoschema: Dispatch<React.SetStateAction<boolean>>;
};

const HomePageContext = createContext({} as HomePageContextModel);

function HomePageContextProvider(props: any) {

  const [isShowMnemoschema, setIsShowMnemoschema] = useState<boolean>(true);

  return (
    <HomePageContext.Provider value={ {
      isShowMnemoschema,
      setIsShowMnemoschema
    } } { ...props } />
  );
}

const useHomePage = () => useContext(HomePageContext);

export { HomePageContextProvider, useHomePage };

