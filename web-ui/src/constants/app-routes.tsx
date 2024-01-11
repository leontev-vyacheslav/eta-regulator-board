import { withNavigationWatcher } from '../contexts/navigation';
import { HomePage, SettingsPage, AboutPage, SignOutPage, DebugPage, AppSettingsPage } from '../pages';

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
        path: '/debug/:modeIdParam',
        component: DebugPage
    },
    {
        path: '/settings/:circuitIdParam',
        component: SettingsPage,
    },
    {
        path: '/app-settings',
        component: AppSettingsPage,
    },
    {
        path: '/about',
        component: AboutPage,
    },
    {
        path: '/logout',
        component: SignOutPage,
    }
];

export default routes.map((route) => {
    return {
        ...route,
        component: withNavigationWatcher(route.component, route.path),
    };
});
