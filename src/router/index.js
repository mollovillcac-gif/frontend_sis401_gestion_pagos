import { getTokenFromLocalStorage } from '@/helpers';
import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('@/views/pages/Main.vue')
        },
        {
            path: '/dashboard',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/pages/Dashboard.vue'),
                    beforeEnter: (to, from, next) => {
                        const authStore = useAuthStore();
                        const userRole = authStore.rol || localStorage.getItem('rol');

                        // Si es cliente, redirigir a solicitudes
                        if (userRole === 'cliente') {
                            next('/pages/solicitudes');
                        } else {
                            next();
                        }
                    }
                },
                {
                    path: '/pages/navieras',
                    name: 'navieras',
                    component: () => import('@/views/pages/Navieras/Navieras.vue')
                },
                {
                    path: '/pages/tarifas',
                    name: 'tarifas',
                    component: () => import('@/views/pages/Tarifas/Tarifas.vue')
                },
                {
                    path: '/pages/roles',
                    name: 'roles',
                    component: () => import('@/views/pages/Roles/Roles.vue')
                },
                {
                    path: '/pages/usuarios',
                    name: 'usuarios',
                    component: () => import('@/views/pages/Usuarios/Usuarios.vue')
                },
                {
                    path: '/pages/configuraciones',
                    name: 'configuraciones',
                    component: () => import('@/views/pages/Configuraciones/Configuraciones.vue')
                },
                {
                    path: '/pages/solicitudes',
                    name: 'solicitudes',
                    component: () => import('@/views/pages/Solicitudes/Solicitudes.vue')
                },
                {
                    path: '/pages/historial-solicitudes',
                    name: 'historial-solicitudes',
                    component: () => import('@/views/pages/Solicitudes/HistorialSolicitudes.vue')
                }
            ]
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: () => import('@/views/pages/auth/ResetPassword.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/views/pages/auth/NotFound.vue')
        },
        {
            path: '/register-cliente',
            name: 'RegisterCliente',
            component: () => import('@/views/pages/auth/RegisterCliente.vue')
        }
    ]
});

router.beforeEach(async (to) => {
    const publicPages = ['/auth/login', '/reset-password', '/register-cliente', '/', '/home'];
    const authRequired = !publicPages.includes(to.path);
    const authStore = useAuthStore();

    if (authRequired && !getTokenFromLocalStorage()) {
        if (authStore) authStore.logout();
        authStore.returnUrl = to.fullPath;
        return '/auth/login';
    }
});

export default router;
