import  { createContext, useCallback, useContext, useRef, createElement } from 'react';
import { confirm } from 'devextreme/ui/dialog';
import { useAuth } from './auth';
import ReactDOMServer from 'react-dom/server';
import AppConstants from '../constants/app-constants';
import { ProcFunc } from '../models/primitive-type';
import { SharedAreaContextModel } from '../models/shared-area-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import TreeView from 'devextreme-react/tree-view';
import { TreeViewItemModel } from '../models/tree-view-item';
import { DisposedTimersDispatcher } from './disposed-timers-dispatcher';

const SharedAreaContext = createContext<SharedAreaContextModel>({} as SharedAreaContextModel);
const useSharedArea = () => useContext(SharedAreaContext);


function SharedAreaProvider (props: AppBaseProviderProps) {
    const { children } = props;
    const { signOut } = useAuth();
    const treeViewRef = useRef<TreeView<TreeViewItemModel>>(null) ;
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
            const loaderWrapper = document.querySelector('.dx-overlay-wrapper.dx-loadpanel-wrapper');

            if(loaderWrapper){
                (loaderWrapper  as HTMLDivElement).style.display = 'none'
            }
        }, 100);
    }, []);

    const showLoader = useCallback<ProcFunc>(() => {
        const loaderWrapper = document.querySelector('.dx-overlay-wrapper.dx-loadpanel-wrapper');

        if(loaderWrapper){
            (loaderWrapper  as HTMLDivElement).style.display = 'block'
        }
    }, []);

    return (
        <SharedAreaContext.Provider value={ {
                signOutWithConfirm,
                treeViewRef,
                showLoader,
                hideLoader,
                disposedTimerDispatcher
            } } { ...props }>
            { children }

        </SharedAreaContext.Provider>
    );
}

export { useSharedArea, SharedAreaProvider };
