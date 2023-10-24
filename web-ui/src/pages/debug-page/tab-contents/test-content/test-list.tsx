import List from 'devextreme-react/list'
import { Ref } from 'react';
import { TestModel } from '../../../../models/data/test-model';
import React from 'react';
import { useTestContext } from './test-context';
import { formatMessage } from 'devextreme/localization';

export type TestListProps = { innerRef?: Ref<List<TestModel>> }

const TestListInner = ({ innerRef }: TestListProps) => {
    const { testList } = useTestContext();

    return (testList
        ? <List className='app-list' ref={ innerRef }
            dataSource={ testList?.items }
            selectionMode={ 'single' }
            height={ '50vh' }
            itemRender={ (item: TestModel) => {
                return <>{item.id}. {item.message}</>
            } }
        />
        : <div className='dx-empty-message' style={ { height: '50vh' } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
    );
}

export const TestList = React.forwardRef<List<TestModel>, TestListProps>((props, ref) =>
  <TestListInner { ...props } innerRef={ ref }/>
);
