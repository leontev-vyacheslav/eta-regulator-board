import './app.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './app-router';
import { AppDataContextProvider } from './contexts/app-data-context';

function App() {
  return (
    <AppDataContextProvider>
      <RouterProvider router={router}/>
    </AppDataContextProvider>
  );
}

export default App;
