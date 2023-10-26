import { useRef } from 'react';
import { TestList } from './test-list';
import { TestModel } from '../../../../models/data/test-model';
import List from 'devextreme-react/list';
import { TestContextProvider } from './test-context';

const TestTabContentInner = () => {
    const listRef = useRef<List<TestModel>>(null);

    return (
        <>
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