<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { useAuthStore } from '@/stores/index';
import { ref, computed } from 'vue';
import PasswordChangeDialog from '@/components/PasswordChangeDialog.vue';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const menu = ref(null);
const passwordDialogVisible = ref(false);

// Información del usuario
const userInfo = computed(() => {
    return {
        username: authStore.user,
        sucursal: authStore.sucursal,
        rol: authStore.rol,
        correo: authStore.correo
    };
});

// Elementos del menú de usuario
const userItems = [
    {
        label: 'Cambiar Contraseña',
        icon: 'pi pi-key',
        command: () => {
            passwordDialogVisible.value = true;
        }
    },
    {
        label: 'Cerrar Sesión',
        icon: 'pi pi-power-off',
        command: () => {
            authStore.logout();
        }
    }
];

// Función para mostrar el menú
const toggle = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <div class="layout-topbar">
        <!-- Sección Izquierda - Logo y Menú -->
        <div class="layout-topbar-left">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu" aria-label="Abrir menú" title="Abrir menú">
                <i class="pi pi-bars"></i>
            </button>
        </div>

        <!-- Sección Derecha - Controles -->
        <div class="layout-topbar-right">
            <div class="system-controls">
                <!-- Botón Modo Oscuro/Claro -->
                <button class="layout-topbar-action" @click="toggleDarkMode" :aria-label="isDarkTheme ? 'Activar modo claro' : 'Activar modo oscuro'" :title="isDarkTheme ? 'Activar modo claro' : 'Activar modo oscuro'">
                    <i :class="['pi', 'action-icon', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>

                <!-- Configurador de Temas -->
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        class="layout-topbar-action"
                        aria-label="Abrir configurador de temas"
                        title="Abrir configurador de temas"
                    >
                        <i class="pi pi-palette action-icon"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <!-- Perfil de usuario -->
            <div class="user-profile">
                <Button text severity="secondary" class="profile-button" @click="toggle" aria-label="Abrir menú de usuario" title="Abrir menú de usuario">
                    <div class="welcome-message" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; flex-direction: column">
                        <span>Bienvenido</span>
                        <span style="font-weight: 600">{{ userInfo.username }}</span>
                    </div>
                    <div class="profile-content">
                        <Avatar
                            icon="pi pi-user"
                            class="user-avatar"
                            shape="circle"
                            :style="{
                                backgroundColor: 'var(--primary-color)',
                                color: '#ffffff'
                            }"
                        />
                        <i class="pi pi-angle-down dropdown-icon"></i>
                    </div>
                </Button>

                <Menu id="overlay_menu" ref="menu" :model="userItems" :popup="true" class="user-menu">
                    <template #start>
                        <div class="menu-header">
                            <span class="menu-title">Información del usuario</span>
                            <div class="menu-tags">
                                <Tag class="menu-tag" :value="`Usuario: ${userInfo.username}`" />
                                <Tag class="menu-tag" :value="`Rol: ${userInfo.rol}`" />
                                <Tag class="menu-tag" :value="`Correo: ${userInfo.correo}`" />
                            </div>
                        </div>
                    </template>
                </Menu>
            </div>
        </div>

        <!-- Diálogo de cambio de contraseña -->
        <PasswordChangeDialog v-model:visible="passwordDialogVisible" />
    </div>
</template>

<style scoped>
.layout-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    background: var(--surface-card);
    border-bottom: 1px solid var(--surface-border);
    height: 64px;
}

.layout-topbar-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.layout-topbar-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.system-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-profile {
    position: relative;
    margin-left: 1rem;
}

.profile-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.username {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-color);
}

.user-meta {
    display: flex;
    gap: 0.5rem;
}

.user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
}

.action-icon {
    font-size: 1.1rem;
    transition: all 0.2s ease;
}

.layout-topbar-action:hover {
    background: var(--surface-hover);
}

.menu-header {
    padding: 1rem;
    border-bottom: 1px solid var(--surface-border);
}

.menu-title {
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
}

.menu-tags {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.menu-tag {
    width: 100%;
    justify-content: start;
}

.app-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color);
}

.profile-button {
    padding: 0.5rem;
    border-radius: var(--border-radius);
}

.dropdown-icon {
    margin-left: 0.5rem;
    color: var(--text-secondary-color);
}
</style>
