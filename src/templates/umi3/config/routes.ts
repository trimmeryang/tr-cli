const routes = [
    { path: '/', layout: false, component: 'login' },
    {
        path: '/login',
        layout: false,
        redirect: '/',
        routes: [
            {
                path: '/login',
                name: '登录',
                component: 'login'
            }
        ]
    },
    {
        path: '/',
        layout: false,
        access: 'canLogin',
        component: '@/layouts/base-layout',
        routes: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: 'dashboard'
            },
            {
                path: '/list',
                name: 'list',
                component: 'list'
            },
            {
                path: '/error',
                name: 'error',
                component: 'error'
            }
        ]
    }
];
export default routes;
