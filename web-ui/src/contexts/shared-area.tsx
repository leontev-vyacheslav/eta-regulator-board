import  { createContext, useCallback, useContext, useRef, createElement } from 'react';
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
import LoadPanel from 'devextreme-react/load-panel';
import { DisposedTimersDispatcher } from './disposed-timers-dispatcher';

const SharedAreaContext = createContext<SharedAreaContextModel>({} as SharedAreaContextModel);
const useSharedArea = () => useContext(SharedAreaContext);


function SharedAreaProvider (props: AppBaseProviderProps) {
    const { children } = props;
    const { signOut } = useAuth();
    const treeViewRef = useRef<TreeView<TreeViewItemModel>>(null) ;
    const loaderRef =  useRef<LoadPanel>(null) ;
    const disposedTimerDispatcher = useRef<DisposedTimersDispatcher>(new DisposedTimersDispatcher());

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
            loaderRef.current?.instance.hide();
        }, 100);
    }, []);

    const showLoader = useCallback<ProcFunc>(() => {
        loaderRef.current?.instance.show();
    }, []);

    return (
        <SharedAreaContext.Provider value={ {
                signOutWithConfirm,
                treeViewRef,
                showLoader,
                hideLoader,
                loaderRef,
                disposedTimerDispatcher
            } } { ...props }>
            { children }
            <Loader />
        </SharedAreaContext.Provider>
    );
}

export { useSharedArea, SharedAreaProvider };
