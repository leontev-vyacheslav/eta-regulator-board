import  { createContext, useCallback, useContext, useRef, useState, createElement } from 'react';
import { confirm } from 'devextreme/ui/dialog';
import { useAuth } from './auth';
import ReactDOMServer from 'react-dom/server';
import AppConstants from '../constants/app-constants';
import Loader from '../components/loader/loader';
import WorkDatePicker from '../components/work-date-picker/work-date-picker';
import { ProcFunc } from '../models/primitive-type';
import { SharedAreaContextModel } from '../models/shared-area-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import TreeView from 'devextreme-react/tree-view';
import { TreeViewItemModel } from '../models/tree-view-item';
import DateBox from 'devextreme-react/date-box';

const SharedAreaContext = createContext<SharedAreaContextModel>({} as SharedAreaContextModel);
const useSharedArea = () => useContext(SharedAreaContext);

function SharedAreaProvider (props: AppBaseProviderProps) {
    const { children } = props;
    const [isShowLoader, setIsShowLoader] = useState<boolean>(false);
    const [isShowWorkDatePicker, setIsWorkDatePicker] = useState<boolean>(false);
    const { signOut } = useAuth();
    const workDatePickerRef = useRef<DateBox>(null);
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

    const showWorkDatePicker = useCallback<ProcFunc>(() => {
        setIsWorkDatePicker(true);
        if (workDatePickerRef && workDatePickerRef.current) {
            workDatePickerRef.current.instance.open();
        }
    }, []);

    const hideWorkDatePicker = useCallback<ProcFunc>(() => {
        setIsWorkDatePicker(false);
    }, []);

    const hideLoader = useCallback<ProcFunc>(() => {
        setTimeout(() => {
            setIsShowLoader(false);
        }, 250);
    }, []);

    const showLoader = useCallback<ProcFunc>(() => {
        setIsShowLoader(true);
    }, []);

    return (
        <SharedAreaContext.Provider value={ { signOutWithConfirm, showWorkDatePicker, showLoader, hideLoader, treeViewRef } } { ...props }>
            { isShowLoader ? <Loader/> : null }
            { isShowWorkDatePicker ? <WorkDatePicker ref={ workDatePickerRef } onClosed={ hideWorkDatePicker }/> : null }
            { children }
        </SharedAreaContext.Provider>
    );
}

export { useSharedArea, SharedAreaProvider };
