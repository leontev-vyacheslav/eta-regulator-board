import { withNavigationWatcher } from '../contexts/navigation';
import { HomePage,  SettingsPage, AboutPage, SignOutPage, DebugPage } from '../pages';

/*
const AboutPage = lazy(() => import('../pages/about/about'));
const SignOutPage = lazy(() => import('../pages/sign-out/sign-out'));
const OrganizationsPage = lazy(() => import('../pages/organizations/organizations'));
const AdministratorsPage = lazy(() => import('../pages/administrators/administrators'));
*/

const routes = [
    {
        path: '/',
        component: HomePage,
    },
    {
        path: '/home',
        component: HomePage,
    },
    {
        path: '/debug',
        component: DebugPage
    },
    {
        path: '/settings',
        component: SettingsPage,
    },
    {
        path: '/about',
        component: AboutPage,
    },
    {
        path: '/logout',
        component: SignOutPage,
    },
];

export default routes.map((route) => {
    return {
        ...route,
        component: withNavigationWatcher(route.component, route.path),
    };
});
