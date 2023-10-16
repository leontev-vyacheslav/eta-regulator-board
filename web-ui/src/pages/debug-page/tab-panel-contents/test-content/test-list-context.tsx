import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { TestListModel } from '../../../../models/data/test-list-model';
import { useAppData } from '../../../../contexts/app-data/app-data';

export type TestListContextModel = {
    testList: TestListModel | null,
    setTestList: Dispatch<SetStateAction<TestListModel | null>>
}

const TestListContext = createContext({} as TestListContextModel);

function TestListContextProvider(props: any) {
    const { getTestListDataAsync } = useAppData();
    const [testList, setTestList] = useState<TestListModel | null>(null);

    useEffect(() => {
        (async () => {
            const testList = await getTestListDataAsync();

            if (testList) {
                setTestList(testList);
            }
        })();
    }, [getTestListDataAsync]);

    return (
        <TestListContext.Provider value={ {
            testList,
            setTestList
        } } { ...props }>
            {props.children}
        </TestListContext.Provider>
    );
}
const useTestListContext = () => useContext(TestListContext);

export { TestListContextProvider, useTestListContext };