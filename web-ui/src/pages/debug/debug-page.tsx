import './debug-page.scss';

import AppConstants from '../../constants/app-constants';
import { DebugIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useRef } from 'react';
import List from 'devextreme-react/list';
import { TestModel } from '../../models/data/test-model';
import { PageToolbar } from '../../components/page-toolbar/page-toolbar';
import { useTestListMenuItems } from './use-test-list-menu-items';
import { TestList } from './test-list';
import { DebugPageContextProvider } from './debug-page-context';

const DebugPageInner = () => {
    const listRef = useRef<List<TestModel>>(null);
    const listMenuItems = useTestListMenuItems({ listRef });

    return (
        <>
            <PageHeader caption={ 'Отладка' }>
                <DebugIcon size={ AppConstants.headerIconSize } />
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <PageToolbar title={ 'Тестовый список' } menuItems={ listMenuItems } />
                    <TestList ref={ listRef } />
                </div>
            </div>
        </>
    )
};

export const DebugPage = () => {
    return (
        <DebugPageContextProvider>
            <DebugPageInner />
        </DebugPageContextProvider>
    );
};
