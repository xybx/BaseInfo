import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/home',
        },
        {
            path: '/index',
            name: 'Index',
            component: () => import('../layout/index/Index.vue'),
            children: [
                {
                    path: '/home',
                    name: 'Home',
                    component: () => import('../views/home/Home.vue'),
                },
            ],
        },
    ],
});

export default router;
