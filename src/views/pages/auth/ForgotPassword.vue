<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/index.ts';

const emit = defineEmits(['close']);

const email = ref('');
const error = ref('');
const success = ref('');
const isLoading = ref(false);
const emailError = ref('');

// Validación de email en tiempo real
watch(email, (newEmail) => {
    if (newEmail && !isValidEmail(newEmail)) {
        emailError.value = 'Por favor, ingresa un correo válido';
    } else {
        emailError.value = '';
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function closeModal() {
    emit('close');
}

async function onSubmit() {
    error.value = '';
    success.value = '';

    if (!email.value) {
        emailError.value = 'El correo es requerido';
        return;
    }

    if (!isValidEmail(email.value)) {
        emailError.value = 'Por favor, ingresa un correo válido';
        return;
    }

    isLoading.value = true;

    try {
        const authStore = useAuthStore();
        const response = await authStore.forgotPassword(email.value);

        success.value = response.message || 'Correo de recuperación enviado exitosamente. Revisa tu bandeja de entrada.';

        setTimeout(() => {
            closeModal();
        }, 5000);
    } catch (err) {
        console.error('Error en forgot password:', err);

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    error.value = 'No existe una cuenta asociada a este correo electrónico.';
                    break;
                case 400:
                    error.value = err.response.data.message || 'Solicitud incorrecta.';
                    break;
                case 500:
                    error.value = 'Error interno del servidor. Inténtalo más tarde.';
                    break;
                default:
                    error.value = err.response.data.message || 'Ocurrió un error inesperado.';
            }
        } else {
            error.value = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="forgot-password-overlay" @click="closeModal">
        <div class="forgot-password-modal" @click.stop>
            <div class="modal-header">
                <h2 class="modal-title">Recuperar Contraseña</h2>
                <Button icon="pi pi-times" class="p-button-text p-button-plain close-btn" @click="closeModal" />
            </div>

            <div class="modal-content">
                <p class="modal-description">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

                <form @submit.prevent="onSubmit">
                    <div class="form-field">
                        <label class="field-label"> Correo Electrónico: </label>
                        <InputText type="email" placeholder="tu@correo.com" class="w-full p-3" v-model="email" :class="{ 'p-invalid': emailError }" />
                        <small v-if="emailError" class="p-error">{{ emailError }}</small>
                    </div>

                    <Message v-if="error" severity="error" class="mb-4">
                        {{ error }}
                    </Message>

                    <Message v-if="success" severity="success" class="mb-4">
                        {{ success }}
                    </Message>

                    <div class="button-group">
                        <Button type="submit" class="primary-btn" :loading="isLoading">Enviar</Button>

                        <Button type="button" severity="secondary" class="secondary-btn" @click="closeModal" :disabled="isLoading"> Cancelar </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.forgot-password-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.forgot-password-modal {
    background: #ffffff;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    border: 2px solid #e5e7eb;
    animation: modalSlideIn 0.3s ease-out;
    position: relative;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
    .forgot-password-modal {
        background: #1f2937;
        border: 2px solid #374151;
        color: #f9fafb;
    }
}

/* Clases específicas para el tema oscuro si usas una clase CSS */
:global(.dark) .forgot-password-modal {
    background: #1f2937 !important;
    border: 2px solid #374151 !important;
    color: #f9fafb !important;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.modal-title {
    color: #111827;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
}

@media (prefers-color-scheme: dark) {
    .modal-title {
        color: #f9fafb;
    }
}

:global(.dark) .modal-title {
    color: #f9fafb !important;
}

.close-btn {
    padding: 0.5rem !important;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
}

.modal-content {
    max-height: 60vh;
    overflow-y: auto;
}

.modal-description {
    color: #6b7280;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

@media (prefers-color-scheme: dark) {
    .modal-description {
        color: #9ca3af;
    }
}

:global(.dark) .modal-description {
    color: #9ca3af !important;
}

.form-field {
    margin-bottom: 1.5rem;
}

.field-label {
    display: block;
    color: #111827;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

@media (prefers-color-scheme: dark) {
    .field-label {
        color: #f9fafb;
    }
}

:global(.dark) .field-label {
    color: #f9fafb !important;
}

.button-group {
    display: flex;
    gap: 0.75rem;
}

.primary-btn {
    flex: 1;
    background: #ea580c !important;
    border-color: #ea580c !important;
    color: white !important;
    font-weight: bold;
    padding: 0.75rem !important;
}

.primary-btn:hover:not(:disabled) {
    background: #dc2626 !important;
    border-color: #dc2626 !important;
}

.secondary-btn {
    flex: 1;
    padding: 0.75rem !important;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-2rem) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (max-width: 640px) {
    .forgot-password-modal {
        margin: 1rem;
        padding: 1.5rem;
    }

    .button-group {
        flex-direction: column;
    }
}
</style>
