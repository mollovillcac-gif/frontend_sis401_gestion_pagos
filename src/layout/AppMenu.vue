<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/index';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

const isAdmin = computed(() => {
    const adminRoles = ['administrador'];
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return adminRoles.includes(rolNormalizado);
});

const isClient = computed(() => {
    const clientRoles = ['cliente'];
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return clientRoles.includes(rolNormalizado);
});

const baseModel = ref([
    {
        label: 'Inicio',
        adminOnly: true,
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-chart-line',
                to: '/dashboard'
            }
        ]
    },
    {
        label: 'Administración',
        icon: 'pi pi-fw pi-cog',
        adminOnly: true,
        items: [
            { label: 'Usuarios', icon: 'pi pi-fw pi-users', to: '/pages/usuarios' },
            { label: 'Roles', icon: 'pi pi-fw pi-user-edit', to: '/pages/roles' },
            { label: 'Configuraciones', icon: 'pi pi-fw pi-sliders-h', to: '/pages/configuraciones' }
        ]
    },
    {
        label: 'Gestión de Solicitudes',
        icon: 'pi pi-fw pi-box',
        adminOnly: true,
        items: [
            { label: 'Solicitudes', icon: 'pi pi-fw pi-file-edit', to: '/pages/solicitudes' },
            { label: 'Historial', icon: 'pi pi-fw pi-history', to: '/pages/historial-solicitudes' },
            { label: 'Navieras', icon: 'pi pi-fw pi-globe', to: '/pages/navieras' },
            { label: 'Tarifas', icon: 'pi pi-fw pi-dollar', to: '/pages/tarifas' }
        ]
    },
    {
        label: 'Servicios al Cliente',
        icon: 'pi pi-fw pi-user',
        clientOnly: true,
        items: [
            { label: 'Mis Solicitudes', icon: 'pi pi-fw pi-file-edit', to: '/pages/solicitudes' },
            { label: 'Historial', icon: 'pi pi-fw pi-history', to: '/pages/historial-solicitudes' },
            { label: 'Navieras', icon: 'pi pi-fw pi-globe', to: '/pages/navieras' },
            { label: 'Tarifas', icon: 'pi pi-fw pi-dollar', to: '/pages/tarifas' }
        ]
    }
]);

const model = computed(() => {
    return baseModel.value.filter((item) => {
        if (item.adminOnly && !isAdmin.value) {
            return false;
        }
        if (item.clientOnly && !isClient.value) {
            return false;
        }

        if (item.items) {
            item.items = item.items.filter((subItem) => {
                if (subItem.adminOnly && !isAdmin.value) {
                    return false;
                }
                if (subItem.clientOnly && !isClient.value) {
                    return false;
                }
                return true;
            });
        }

        return true;
    });
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <!-- Opciones accesibles para todos abajo -->
        <li class="menu-separator"></li>
        <li>
            <router-link to="/" class="layout-menuitem-text" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 1.2rem">
                <i class="pi pi-home layout-menuitem-icon"></i>
                <span>Ir a la página principal</span>
            </router-link>
        </li>
        <li>
            <button @click="authStore.logout()" class="layout-menuitem-text" style="display: flex; align-items: center; gap: 8px; padding: 0.7rem 1.2rem">
                <i class="pi pi-sign-out layout-menuitem-icon"></i>
                <span>Salir</span>
            </button>
        </li>
    </ul>
</template>

<style lang="scss" scoped></style>
