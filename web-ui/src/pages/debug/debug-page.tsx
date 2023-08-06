import './debug-page.scss';

import AppConstants from '../../constants/app-constants';
import { AddIcon, DebugIcon, DeleteIcon, EditIcon, ExtensionIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../../contexts/app-data';
import { TestListModel } from '../../models/data/test-list-model';
import List from 'devextreme-react/list';
import { TestModel } from '../../models/data/test-model';
import { PageToolbar } from '../../components/page-toolbar/page-toolbar';
// import { ReactComponent as AppAbout } from '../../assets/app-about.svg'

const DebugPage = () => {
    const { getTestListDataAsync, postTestDataAsync, putTestDataAsync, deleteTestDataAsync } = useAppData();

    const [testList, setTestList] = useState<TestListModel | null>(null);

    const listRef = useRef<List<TestModel>>(null)

    useEffect(() => {
        (async () => {
            const testList = await getTestListDataAsync();

            if (testList) {
                setTestList(testList);
            }
        })();
    }, [getTestListDataAsync]);

    return (
        <>
            <PageHeader caption={ 'Отладка' }>
                <DebugIcon size={ AppConstants.headerIconSize } />
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <PageToolbar title={ 'Test list' } menuItems={ [{
                        icon: () => <ExtensionIcon size={ 20 } color='black' />,
                        items: [{
                            text: 'Post...',
                            icon: () => <AddIcon size={ 20 } />,
                            onClick: async () => {
                                const test = await postTestDataAsync({
                                    id: 0,
                                    message: 'Hi, there'
                                });
                                if (test) {
                                    //
                                }
                            }
                        },
                        {
                            text: 'Put...',
                            icon: () => <EditIcon size={ 20 } />,
                            onClick: async () => {
                                const test = await putTestDataAsync({
                                    id: 2,
                                    message: 'Test2 with changes'
                                });

                                if (test) {
                                    //
                                }
                            }
                        },
                        {
                            text: 'Delete...',
                            icon: () => <DeleteIcon size={ 20 } />,
                            onClick: async () => {
                                if (listRef && listRef.current) {
                                    const selectedItems = listRef.current.instance.option('selectedItems');

                                    if (selectedItems && selectedItems.length > 0) {
                                        const testId = selectedItems.find(() => true)!.id;
                                        const test = await deleteTestDataAsync(testId);

                                        if (test) {
                                            //
                                        }
                                    } else {
                                        //
                                    }
                                }
                            }
                        }]
                    }] } />
                    <List ref={ listRef }
                        dataSource={ testList?.items }
                        selectionMode={ 'single' }
                        height={ 300 }
                        itemRender={ (item: TestModel) => {
                            return <>{item.id}. {item.message}</>
                        } }
                    />
                </div>
            </div>
        </>
    )
};

export default DebugPage;
