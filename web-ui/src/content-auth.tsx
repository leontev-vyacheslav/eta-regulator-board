import { Navigate, Route, Routes } from 'react-router-dom';
import routes from './constants/app-routes';
import { SideNavOuterToolbar as SideNavBarLayout } from './layouts';
import { Footer } from './components';
import AppConstants from './constants/app-constants';
import NotFoundPage from './pages/not-found/not-found-page';



const ContentAuth = () => {
    return (
        <>
            <SideNavBarLayout title={ AppConstants.appInfo.title }>
                <Routes>
                    { routes.map(({ path, component }) => (
                        <Route key={ typeof path === 'string' ? path : (path as string[]).join(';') } path={ path } element={ component }/>
                    )) }
                    <Route path='/not-found' element={ <NotFoundPage /> } />
                    <Route path='*' element={ <Navigate to='/not-found' replace /> } />
                </Routes>
                <Footer>
                    <div> Copyright © { new Date().getFullYear() } { AppConstants.appInfo.companyName }.</div>
                </Footer>
            </SideNavBarLayout>
        </>
    );
}
export default ContentAuth;
