import { createContext, Dispatch, useContext, useState } from 'react';
import { getQuickGuid } from '../../utils/uuid';


export type HomePageContextModel = {
  isShowMnemoschema: boolean;
  setIsShowMnemoschema: Dispatch<React.SetStateAction<boolean>>;
  updateSharedRegulatorStateRefreshToken: string,
  setUpdateSharedRegulatorStateRefreshToken: Dispatch<React.SetStateAction<string>>;
};

const HomePageContext = createContext({} as HomePageContextModel);

function HomePageContextProvider(props: any) {

  const [isShowMnemoschema, setIsShowMnemoschema] = useState<boolean>(true);
  const [updateSharedRegulatorStateRefreshToken, setUpdateSharedRegulatorStateRefreshToken] = useState<string>(getQuickGuid());

  return (
    <HomePageContext.Provider value={ {
      isShowMnemoschema,
      setIsShowMnemoschema,
      updateSharedRegulatorStateRefreshToken,
      setUpdateSharedRegulatorStateRefreshToken
    } } { ...props } />
  );
}

const useHomePage = () => useContext(HomePageContext);

export { HomePageContextProvider, useHomePage };

