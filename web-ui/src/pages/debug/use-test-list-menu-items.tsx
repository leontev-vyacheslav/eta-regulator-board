import { useCallback, useMemo } from 'react'
import { AddIcon, DeleteIcon, EditIcon, ExtensionIcon } from '../../constants/app-icons';
import { useAppData } from '../../contexts/app-data';
import { List } from 'devextreme-react/list';
import { TestModel } from '../../models/data/test-model';
import { useDebugPageContext } from './debug-page-context';
import notify from 'devextreme/ui/notify';
import { showConfirmDialog, showPromptDialog } from '../../utils/dialogs';

export const useTestListMenuItems = ({ listRef }: { listRef: React.RefObject<List<TestModel, any>> }) => {
    const { postTestDataAsync, putTestDataAsync, deleteTestDataAsync } = useAppData();
    const { setTestList } = useDebugPageContext();

    const addTestItemAsync = useCallback(async () => {
        showPromptDialog({
            title: 'Новое тестовое значение',
            iconName: 'AddIcon',

            callback: async ({ text }: { text: string }) => {
                if (text) {
                    const test = await postTestDataAsync({
                        id: 0,
                        message: text
                    });

                    if (test) {
                        setTestList(previous => {
                            return previous ? { ...previous, items: [...previous.items, test] } : null;
                        });

                        notify({
                            type: 'success',
                            message: `The test list item  was successfully added with the identifier ${test.id}!`
                        }, { position: 'bottom center', direction: 'down-stack' });
                    }
                }
            },
            textRender: () => {
                return <div>Введите текстовое значение</div>
            }
        });




    }, [postTestDataAsync, setTestList]);

    const updateTestItemAsync = useCallback(async () => {
        const test = await putTestDataAsync({
            id: 2,
            message: 'Test2 with changes'
        });

        if (test) {
            //
        }
    }, [putTestDataAsync]);

    const deleteTestItemAsync = useCallback(async () => {
            if (!listRef || !listRef.current) {
                return;
            }

            const selectedItems = listRef.current.instance.option('selectedItems');

            if (selectedItems && selectedItems.length > 0) {
                const testId = selectedItems.find(() => true)!.id;

                showConfirmDialog({
                    title: 'Confirm',
                    iconName: 'EditIcon',
                    callback: async () => {
                        const test = await deleteTestDataAsync(testId);
                        if (test) {
                            setTestList(previous => {
                                return previous ? { ...previous, items: previous.items.filter(i => i.id !== test.id) } : null;
                            });

                            notify({
                                type: 'success',
                                message: `The test list item with the identifier ${test.id} was successfully deleted!`
                            }, { position: 'bottom center', direction: 'down-stack' });

                            return;
                        }

                        notify({
                            type: 'error',
                            message: 'The test list item with ${test.id} was not deleted because of an error!'
                        }, { position: 'bottom center', direction: 'down-stack' });
                    },
                    textRender: () => {
                        return <> { `Do you really want to delete the test list item with id ${testId}?` } </>;
                    }
                });

                return;
            }

            notify({
                type: 'warning',
                message: 'No one test item was selected!'
            }, { position: 'bottom center', direction: 'down-stack' });

    }, [deleteTestDataAsync, listRef, setTestList]);

    return useMemo(() => {
        return [{
            icon: () => <ExtensionIcon size={ 20 } color='black' />,
            items: [{
                text: 'Add...',
                icon: () => <AddIcon size={ 20 } />,
                onClick: addTestItemAsync
            },
            {
                text: 'Update...',
                icon: () => <EditIcon size={ 20 } />,
                onClick: updateTestItemAsync
            },
            {
                text: 'Delete...',
                icon: () => <DeleteIcon size={ 20 } />,
                onClick: deleteTestItemAsync
            }]
        }];
    }, [addTestItemAsync, deleteTestItemAsync, updateTestItemAsync])
}
