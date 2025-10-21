<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import ForgotPassword from './ForgotPassword.vue';
import { useAuthStore } from '@/stores/index.ts';
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';

const usuario = ref('');
const clave = ref('');
const error = ref('');
const isLoading = ref(false);
const showForgotPasswordModal = ref(false);

useLayout();

function onSubmit() {
    if (!usuario.value || !clave.value) {
        error.value = 'Por favor, completa todos los campos.';
        return;
    }

    error.value = '';
    isLoading.value = true;

    const authStore = useAuthStore();
    authStore
        .login(usuario.value, clave.value)
        .then(() => {
            console.log('Inicio de sesión exitoso.');
            console.log('Usuario:', authStore.user);
            console.log('Rol:', authStore.rol);
        })
        .catch((err) => {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        error.value = err.response.data.message || 'Solicitud incorrecta.';
                        break;
                    case 401:
                        error.value = err.response.data.message || 'No autorizado.';
                        break;
                    case 404:
                        error.value = err.response.data.message || 'Recurso no encontrado.';
                        break;
                    case 409:
                        error.value = err.response.data.message || 'Conflicto en la solicitud.';
                        break;
                    case 500:
                        error.value = err.response.data.message || 'Error interno del servidor.';
                        break;
                    default:
                        error.value = 'Ocurrió un error inesperado.';
                }
            } else {
                console.log('Error:', err);
                error.value = 'No se pudo conectar con el servidor.';
            }
        })
        .finally(() => {
            isLoading.value = false;
        });
}

function handleForgotPassword() {
    showForgotPasswordModal.value = true;
}

function closeForgotPasswordModal() {
    showForgotPasswordModal.value = false;
}
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center w-full">
            <div class="w-full max-w-[600px] bg-surface-0 dark:bg-surface-900 p-12 rounded-2xl shadow-xl">
                <div class="text-center mb-10">
                    <h1 class="text-surface-900 dark:text-surface-0 text-4xl font-bold mb-3">Bienvenido/a</h1>
                    <p class="text-muted-color text-xl">Inicia Sesión/Registrate para continuar</p>
                </div>

                <form @submit.prevent="onSubmit" class="w-full">
                    <div class="mb-8">
                        <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4">Usuario:</label>
                        <InputText type="text" placeholder="Usuario" class="w-full p-4 text-xl input-uniform" v-model="usuario" />
                    </div>

                    <div class="mb-8">
                        <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4">Contraseña:</label>
                        <Password v-model="clave" placeholder="Contraseña" :toggleMask="true" class="w-full [&>input]:text-md input-uniform" :feedback="false" />
                    </div>

                    <Message v-if="error" severity="error" class="mb-6">{{ error }}</Message>

                    <Button type="submit" :disabled="isLoading" class="w-full bg-primary hover:bg-primary-dark text-white dark:text-surface-0 font-bold py-5 px-8 rounded-xl text-xl mb-6">
                        {{ isLoading ? 'Cargando...' : 'Iniciar Sesión' }}
                    </Button>

                    <!-- Forgot Password Link -->
                    <div class="text-center mb-6">
                        <a href="#" @click.prevent="handleForgotPassword" class="text-primary hover:underline"> ¿Olvidaste tu contraseña? </a>
                    </div>
                    <div class="text-center mb-6">
                        <router-link to="/register-cliente" class="text-primary hover:underline"> Registrarse </router-link>
                    </div>
                    <div class="text-center mb-6">
                        <router-link to="/" class="text-primary hover:underline"> Volver al inicio </router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal de Recuperación de Contraseña -->
    <ForgotPassword v-if="showForgotPasswordModal" @close="closeForgotPasswordModal" />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.p-password-input {
    width: 100%;
}

.input-uniform {
    width: 100% !important;
}

:deep(.p-password) {
    width: 100%;
}

:deep(.p-password input) {
    width: 100%;
    padding: 0.8rem !important;
}

img {
    min-height: 7rem;
}
</style>
