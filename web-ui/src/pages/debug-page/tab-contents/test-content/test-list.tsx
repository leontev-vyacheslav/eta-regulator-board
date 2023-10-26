import List from 'devextreme-react/list'
import { TestModel } from '../../../../models/data/test-model';
import React from 'react';
import { useTestContext } from './test-context';
import { formatMessage } from 'devextreme/localization';
import { useScreenSize } from '../../../../utils/media-query';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { useTestListMenuItems } from './use-test-list-menu-items';

export type TestListProps = { innerRef?: React.Ref<List<TestModel>> }

const TestListInner = ({ innerRef }: TestListProps) => {
    const { testList } = useTestContext();
    const { isXSmall, isSmall } = useScreenSize();
    const listMenuItems = useTestListMenuItems({ listRef: (innerRef as React.RefObject<List<TestModel>>) });

    return (testList
     ?
        <>
            <PageToolbar title={ 'Тестовый список' } menuItems={ listMenuItems } style={ { width: isXSmall || isSmall ? '100%' : 600 } } />
            <List className='app-list' ref={ innerRef }
                dataSource={ testList?.items }
                selectionMode={ 'single' }
                height={ '50vh' }
                width={ isXSmall || isSmall ? '100%' : 600 }
                itemRender={ (item: TestModel) => {
                    return <>{item.id}. {item.message}</>
                } }
            />
        </>
        : <div className='dx-empty-message' style={ { height: '50vh' } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
    );
}

export const TestList = React.forwardRef<List<TestModel>, TestListProps>((props, ref) =>
  <TestListInner { ...props } innerRef={ ref }/>
);
