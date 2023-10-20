import { useRef } from 'react';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { TestList } from './test-list';
import { useTestListMenuItems } from './use-test-list-menu-items';
import { TestModel } from '../../../../models/data/test-model';
import List from 'devextreme-react/list';
import { TestContextProvider } from './test-context';

const TestTabContentInner = () => {
    const listRef = useRef<List<TestModel>>(null);
    const listMenuItems = useTestListMenuItems({ listRef });

    return (
        <>
            <PageToolbar title={ 'Тестовый список' } menuItems={ listMenuItems } />
            <TestList ref={ listRef } />
        </>
    )
}

export const TestTabContent = () => {
    return (
        <TestContextProvider>
            <TestTabContentInner />
        </TestContextProvider>
    )
}