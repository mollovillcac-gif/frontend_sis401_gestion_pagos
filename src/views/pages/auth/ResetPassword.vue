<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useAuthStore } from '@/stores/index.ts';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const token = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const isLoading = ref(false);
const isVerifying = ref(true);
const tokenValid = ref(false);
const tokenError = ref('');

// Validaciones
const passwordError = ref('');
const confirmPasswordError = ref('');

// Validación de contraseña en tiempo real
watch(newPassword, (newPass) => {
    if (newPass && newPass.length < 6) {
        passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
    } else {
        passwordError.value = '';
    }

    // Revalidar confirmación si ya hay algo escrito
    if (confirmPassword.value) {
        validateConfirmPassword();
    }
});

watch(confirmPassword, () => {
    validateConfirmPassword();
});

function validateConfirmPassword() {
    if (confirmPassword.value && confirmPassword.value !== newPassword.value) {
        confirmPasswordError.value = 'Las contraseñas no coinciden';
    } else {
        confirmPasswordError.value = '';
    }
}

onMounted(async () => {
    // Obtener token de la URL
    token.value = route.query.token;

    if (!token.value) {
        tokenValid.value = false;
        tokenError.value = 'Token no encontrado en la URL';
        isVerifying.value = false;
        return;
    }

    // Verificar token
    await verifyToken();
});

async function verifyToken() {
    try {
        const authStore = useAuthStore();
        const response = await authStore.verifyResetToken(token.value);

        if (response.valid) {
            tokenValid.value = true;
        } else {
            tokenValid.value = false;
            tokenError.value = response.message || 'Token inválido o expirado';
        }
    } catch (err) {
        console.error('Error verificando token:', err);
        tokenValid.value = false;
        tokenError.value = 'Error al verificar el token';
    } finally {
        isVerifying.value = false;
    }
}

async function onSubmit() {
    // Limpiar errores previos
    error.value = '';
    success.value = '';

    // Validaciones
    if (!newPassword.value) {
        passwordError.value = 'La contraseña es requerida';
        return;
    }

    if (newPassword.value.length < 6) {
        passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }

    if (!confirmPassword.value) {
        confirmPasswordError.value = 'Debes confirmar la contraseña';
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        confirmPasswordError.value = 'Las contraseñas no coinciden';
        return;
    }

    isLoading.value = true;

    try {
        const authStore = useAuthStore();
        const response = await authStore.resetPassword(token.value, newPassword.value);

        success.value = response.message || 'Contraseña actualizada exitosamente';

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
            router.push('/auth/login');
        }, 5000);
    } catch (err) {
        console.error('Error reseteando contraseña:', err);

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    error.value = err.response.data.message || 'Token inválido o expirado';
                    break;
                case 404:
                    error.value = 'Usuario no encontrado';
                    break;
                case 500:
                    error.value = 'Error interno del servidor';
                    break;
                default:
                    error.value = err.response.data.message || 'Ocurrió un error inesperado';
            }
        } else {
            error.value = 'No se pudo conectar con el servidor';
        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center w-full">
            <div class="w-full max-w-[600px] bg-surface-0 dark:bg-surface-900 p-12 rounded-2xl shadow-xl">
                <!-- Loading State -->
                <div v-if="isVerifying" class="text-center">
                    <ProgressSpinner class="mb-4" />
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-3">Verificando enlace...</h2>
                    <p class="text-muted-color">Por favor espera mientras verificamos tu enlace de recuperación.</p>
                </div>

                <!-- Invalid Token State -->
                <div v-else-if="!tokenValid" class="text-center">
                    <i class="pi pi-times-circle text-6xl text-red-500 mb-4"></i>
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-3">Enlace Inválido</h2>
                    <Message severity="error" class="mb-6">
                        {{ tokenError }}
                    </Message>
                </div>

                <!-- Reset Password Form -->
                <div v-else class="text-center">
                    <i class="pi pi-lock text-6xl text-primary mb-4"></i>
                    <h1 class="text-surface-900 dark:text-surface-0 text-4xl font-bold mb-3">Nueva Contraseña</h1>
                    <p class="text-muted-color text-xl mb-8">Ingresa tu nueva contraseña</p>

                    <form @submit.prevent="onSubmit" class="w-full text-left">
                        <div class="mb-6">
                            <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4"> Nueva Contraseña: </label>
                            <Password
                                v-model="newPassword"
                                placeholder="Nueva contraseña"
                                :toggleMask="true"
                                class="w-full [&>input]:text-md input-uniform"
                                :feedback="true"
                                :class="{ 'p-invalid': passwordError }"
                                promptLabel="Ingresa una contraseña"
                                weakLabel="Débil"
                                mediumLabel="Media"
                                strongLabel="Fuerte"
                            />
                            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
                        </div>

                        <div class="mb-8">
                            <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4"> Confirmar Contraseña: </label>
                            <Password v-model="confirmPassword" placeholder="Confirmar contraseña" :toggleMask="true" class="w-full [&>input]:text-md input-uniform" :feedback="false" :class="{ 'p-invalid': confirmPasswordError }" />
                            <small v-if="confirmPasswordError" class="p-error">{{ confirmPasswordError }}</small>
                        </div>

                        <Message v-if="error" severity="error" class="mb-6">
                            {{ error }}
                        </Message>

                        <Message v-if="success" severity="success" class="mb-6">
                            {{ success }}
                        </Message>

                        <Button type="submit" class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 px-8 rounded-xl text-xl mb-6" :loading="isLoading">
                            {{ isLoading ? 'Actualizando...' : 'Actualizar Contraseña' }}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
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
</style>
