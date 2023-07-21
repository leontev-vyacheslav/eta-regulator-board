import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDataContext } from '../../../contexts/app-data-context';
import { TestModel } from '../../../models/data/test-model'

export const HomePage = () => {
  const [testList, setTestList] = useState<TestModel[] | null>(null);
  const { getTestListAsync } = useAppDataContext();

  const buttonClickHandlerAsync = useCallback(async () => {
    const testList = await getTestListAsync();
    if (testList) {
      setTestList(testList);
    }
  }, [getTestListAsync]);

  return (
    <>
      <div>Home page</div>
      <button onClick={buttonClickHandlerAsync}>Get test data</button>
      {
        testList
        ? testList.map(t => {
          return <div key={t.id}>{t.message}</div>
        })
        : null
      }
      <div>
        <Link to={'test'}>To test page</Link>
      </div>
    </>
  );
}