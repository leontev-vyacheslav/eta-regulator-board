import List from 'devextreme-react/list'
import { Ref } from 'react';
import { TestModel } from '../../models/data/test-model';
import React from 'react';
import { useDebugPageContext } from './debug-page-context';

export type TestListProps = { innerRef?: Ref<List<TestModel>> }

const TestListInner = ({ innerRef }: TestListProps) => {
    const { testList } = useDebugPageContext();

    return  <List className='app-list' ref={ innerRef }
        dataSource={ testList?.items }
        selectionMode={ 'single' }
        height={ 150 }
        itemRender={ (item: TestModel) => {
            return <>{item.id}. {item.message}</>
        } }
    />
}

export const TestList = React.forwardRef<List<TestModel>, TestListProps>((props, ref) =>
  <TestListInner { ...props } innerRef={ ref }/>
);
