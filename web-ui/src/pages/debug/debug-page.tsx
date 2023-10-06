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
import { Button } from 'devextreme-react';
import { useAppData } from '../../contexts/app-data/app-data';
// import { ReactComponent as AppAbout } from '../../assets/app-about.svg'

const DebugPageInner = () => {
    const listRef = useRef<List<TestModel>>(null);
    const listMenuItems = useTestListMenuItems({ listRef });
    const { getRegulatorSettingsAsync } = useAppData();

    return (
        <>
            <PageHeader caption={ 'Отладка' }>
                <DebugIcon size={ AppConstants.headerIconSize } />
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <PageToolbar title={ 'Тестовый список' } menuItems={ listMenuItems } />
                    <TestList ref={ listRef } />
                    <Button text={ 'Regulator settings' } onClick={ async () => {
                        const regulatorSettings = await getRegulatorSettingsAsync();
                        console.log(regulatorSettings);
                    } } />
                </div>
            </div>
        </>
    )
};

export default () => {
    return (
    <DebugPageContextProvider>
        <DebugPageInner />
    </DebugPageContextProvider>
    );
};
