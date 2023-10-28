import  { createContext, useCallback, useContext, useRef, useState, createElement } from 'react';
import { confirm } from 'devextreme/ui/dialog';
import { useAuth } from './auth';
import ReactDOMServer from 'react-dom/server';
import AppConstants from '../constants/app-constants';
import Loader from '../components/loader/loader';
import { ProcFunc } from '../models/primitive-type';
import { SharedAreaContextModel } from '../models/shared-area-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import TreeView from 'devextreme-react/tree-view';
import { TreeViewItemModel } from '../models/tree-view-item';

const SharedAreaContext = createContext<SharedAreaContextModel>({} as SharedAreaContextModel);
const useSharedArea = () => useContext(SharedAreaContext);

function SharedAreaProvider (props: AppBaseProviderProps) {
    const { children } = props;
    const [isShowLoader, setIsShowLoader] = useState<boolean>(false);
    const { signOut } = useAuth();
    const treeViewRef = useRef<TreeView<TreeViewItemModel>>(null) ;

    const signOutWithConfirm = useCallback<ProcFunc>(() => {
        const confirmSignOutContent = () => {
            return (
                <div style={ { display: 'flex', alignItems: 'center' } }>
                    <i className={ 'dx-icon dx-icon-runner' } style={ { fontSize: '3em', color: AppConstants.colors.baseDarkgreyTextColor } }/>
                    <span>Действительно хотите <b>выйти</b> из приложения!</span>
                </div>
            );
        };
        const content = ReactDOMServer.renderToString(
            createElement(
                confirmSignOutContent as any,
                {}
            )
        );
        confirm(content, 'Выход').then(async (dialogResult) => {
            if (dialogResult) {
                await signOut();
            }
        });
    }, [signOut]);

    const hideLoader = useCallback<ProcFunc>(() => {
        setTimeout(() => {
            setIsShowLoader(false);
        }, 250);
    }, []);

    const showLoader = useCallback<ProcFunc>(() => {
        setIsShowLoader(true);
    }, []);

    return (
        <SharedAreaContext.Provider value={ { signOutWithConfirm, showLoader, hideLoader, treeViewRef } } { ...props }>
            { isShowLoader ? <Loader/> : null }
            { children }
        </SharedAreaContext.Provider>
    );
}

export { useSharedArea, SharedAreaProvider };
