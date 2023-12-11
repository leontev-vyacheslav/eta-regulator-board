import { withNavigationWatcher } from '../contexts/navigation';
import { HomePage, SettingsPage, AboutPage, SignOutPage, DebugPage } from '../pages';

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
        path: '/settings/:circuitIdParam',
        component: SettingsPage,
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
