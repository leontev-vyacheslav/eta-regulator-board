import { createBrowserRouter } from 'react-router-dom';
import App from './app';
import { ErrorPage } from './components/pages/error-page/error-page';
import { TestPage } from './components/pages/test-page/test-page';
import { HomePage } from './components/pages/home-page/home-page';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: 'test',
        
        element: <TestPage />
    }
]);