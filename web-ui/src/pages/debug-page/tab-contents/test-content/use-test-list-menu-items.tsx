import { useCallback, useMemo } from 'react'
import { AddIcon, DeleteIcon, EditIcon, ExtensionIcon, RefreshIcon } from '../../../../constants/app-icons';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { List } from 'devextreme-react/list';

import { TestModel } from '../../../../models/data/test-model';
import { useTestContext } from './test-context';
import { showConfirmDialog, showPromptDialog } from '../../../../utils/dialogs';
import { proclaim } from '../../../../utils/proclaim';
import { formatMessage } from 'devextreme/localization';

export const useTestListMenuItems = ({ listRef }: { listRef: React.RefObject<List<TestModel, any>> }) => {
    const { getTestListDataAsync, postTestDataAsync, putTestDataAsync, deleteTestDataAsync } = useAppData();
    const { setTestList } = useTestContext();

    const refreshTestListAsync = useCallback(async () => {
        const testList = await getTestListDataAsync();
        if (testList) {
            setTestList(testList);
        }

    }, [getTestListDataAsync, setTestList]);

    const addTestItemAsync = useCallback(async () => {
        showPromptDialog({
            title: 'Новое тестовое значение',
            iconName: 'AddIcon',
            callback: async ({ text }: { text: string }) => {
                if (text) {
                    const currentTest = await postTestDataAsync({
                        id: 0,
                        message: text
                    });

                    if (currentTest) {
                        setTestList(previous => {
                            return previous ? { ...previous, items: [...previous.items, currentTest] } : null;
                        });

                        proclaim({
                            type: 'success',
                            message: `Тестовый элемент с идентификатором ${currentTest.id}  был успешно добавлен!`,
                        });
                    }
                }
            }
        });
    }, [postTestDataAsync, setTestList]);

    const updateTestItemAsync = useCallback(async () => {

        if (!listRef || !listRef.current) {
            return;
        }

        const selectedItems = listRef.current.instance.option('selectedItems');

        if (selectedItems && selectedItems.length > 0) {
            const originalTest = selectedItems.find(() => true);

            if (!originalTest) {
                return;
            }

            showPromptDialog({
                title: 'Тестовое значение',
                iconName: 'EditIcon',
                text: originalTest.message,
                callback: async ({ text }: { text: string }) => {
                    const currentTest = await putTestDataAsync({ ...originalTest, message: text });

                    if (currentTest) {
                        setTestList(previous => {
                            const changedTest = previous!.items.find(i => i.id === currentTest.id)!;
                            changedTest.message = currentTest.message;

                            return { ...previous! };
                        });
                    }
                }
            });

            return;
        }

        proclaim({
            type: 'warning',
            message: 'Не выделен ни один элемент списка!',
        });


    }, [listRef, putTestDataAsync, setTestList]);

    const deleteTestItemAsync = useCallback(async () => {
            if (!listRef || !listRef.current) {
                return;
            }

            const selectedItems = listRef.current.instance.option('selectedItems');

            if (selectedItems && selectedItems.length > 0) {
                const originalTest = selectedItems.find(() => true)!;

                showConfirmDialog({
                    title: formatMessage('confirm-title'),
                    iconName: 'DeleteIcon',
                    iconSize: 36,
                    callback: async () => {
                        const currentTest = await deleteTestDataAsync(originalTest.id);
                        if (currentTest) {
                            setTestList(previous => {
                                return previous ? { ...previous, items: previous.items.filter(i => i.id !== currentTest.id) } : null;
                            });

                            proclaim({
                                type: 'success',
                                message: `Тестовый элемент с идентификатором  ${currentTest.id} успешно удален!`,
                            });

                            return;
                        }

                        proclaim({
                            type: 'error',
                            message:  `Тестовый элемент с идентификатором ${originalTest.id} не был удален из-за ошибки!`,
                        });
                    },
                    textRender: () => {
                        return <> { `Действительно хотите удалить Тестовый элемент с идентификатором ${originalTest!.id}?` } </>;
                    }
                });

                return;
            }

            proclaim({
                type: 'warning',
                message: 'Не выделен ни один элемент списка!',
            });

    }, [deleteTestDataAsync, listRef, setTestList]);

    return useMemo(() => {
        return [{
            icon: () => <ExtensionIcon size={ 20 } color='black' />,
            items: [
                {
                    text: 'Обновить список...',
                    icon: () => <RefreshIcon size={ 20 } />,
                    onClick: refreshTestListAsync
                },
                {
                    text: 'Добавить...',
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addTestItemAsync
                },
                {
                    text: 'Изменить...',
                    icon: () => <EditIcon size={ 20 } />,
                    onClick: updateTestItemAsync
                },
                {
                    text: 'Удалить...',
                    icon: () => <DeleteIcon size={ 20 } />,
                    onClick: deleteTestItemAsync
                }
            ]
        }];
    }, [addTestItemAsync, deleteTestItemAsync, refreshTestListAsync, updateTestItemAsync])
}
