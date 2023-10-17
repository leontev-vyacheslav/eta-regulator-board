import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { TestListModel } from '../../../../models/data/test-list-model';
import { useAppData } from '../../../../contexts/app-data/app-data';

export type TestContextModel = {
    testList: TestListModel | null,
    setTestList: Dispatch<SetStateAction<TestListModel | null>>
}

const TestTabContext = createContext({} as TestContextModel);

function TestContextProvider(props: any) {
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
        <TestTabContext.Provider value={ {
            testList,
            setTestList
        } } { ...props }>
            {props.children}
        </TestTabContext.Provider>
    );
}

const useTestContext = () => useContext(TestTabContext);

export { TestContextProvider,useTestContext };