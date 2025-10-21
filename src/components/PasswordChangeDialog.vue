<script setup>
import { ref, reactive, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, sameAs, helpers, maxLength } from '@vuelidate/validators';
import { useAuthStore } from '@/stores/index';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible']);

// Stores y servicios
const authStore = useAuthStore();
const toast = useToast();

// Estado del formulario
const formData = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Estados para mostrar/ocultar contraseñas
const showoldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Validaciones
const rules = computed(() => ({
    oldPassword: {
        required: helpers.withMessage('La contraseña actual es requerida', required)
    },
    newPassword: {
        required: helpers.withMessage('La nueva contraseña es requerida', required),
        minLength: helpers.withMessage('La contraseña debe tener al menos 6 caracteres', minLength(6)),
        maxLength: helpers.withMessage('La contraseña no puede tener más de 20 caracteres', maxLength(20))
    },
    confirmPassword: {
        required: helpers.withMessage('Debe confirmar la nueva contraseña', required),
        sameAsPassword: helpers.withMessage('Las contraseñas no coinciden', sameAs(formData.newPassword))
    }
}));

const v$ = useVuelidate(rules, formData);

// Estado de carga
const loading = ref(false);

// Cerrar el diálogo y reiniciar el formulario
const hideDialog = () => {
    resetForm();
    emit('update:visible', false);
};

// Reiniciar el formulario
const resetForm = () => {
    formData.oldPassword = '';
    formData.newPassword = '';
    formData.confirmPassword = '';
    showoldPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
    v$.value.$reset();
};

// Guardar la nueva contraseña
const savePassword = async () => {
    loading.value = true;

    try {
        const isValid = await v$.value.$validate();
        if (!isValid) {
            loading.value = false;
            return;
        }

        // Llamada a la función del backend para cambiar la contraseña
        const response = await authStore.changePassword({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword
        });

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Contraseña actualizada correctamente',
            life: 3000
        });

        hideDialog();

        // Si el backend requiere un nuevo login después de cambiar la contraseña
        if (response.status === 200) {
            setTimeout(() => {
                authStore.logout();
            }, 3000); // Dar tiempo para que se muestre el mensaje de éxito
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'No se pudo actualizar la contraseña',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Alternar mostrar/ocultar contraseña
const togglePassword = (field) => {
    if (field === 'current') showoldPassword.value = !showoldPassword.value;
    if (field === 'new') showNewPassword.value = !showNewPassword.value;
    if (field === 'confirm') showConfirmPassword.value = !showConfirmPassword.value;
};
</script>

<template>
    <Dialog :visible="props.visible" class="p-6 bg-white rounded-lg shadow-lg w-[500px] max-w-full" :modal="true" header="Cambiar Contraseña" @update:visible="(value) => emit('update:visible', value)">
        <div class="grid gap-4">
            <!-- Contraseña Actual -->
            <div class="flex flex-col">
                <label for="oldPassword" class="text-sm font-semibold"> Contraseña Actual <span class="text-red-500">*</span> </label>
                <div class="relative">
                    <input
                        :type="showoldPassword ? 'text' : 'password'"
                        v-model="formData.oldPassword"
                        id="oldPassword"
                        class="w-full p-2 border rounded-md pr-10"
                        :class="{ 'border-red-500': v$.oldPassword.$error }"
                        @blur="v$.oldPassword.$touch()"
                    />
                    <button type="button" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" @click="togglePassword('current')">
                        <i :class="['pi', showoldPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </button>
                </div>
                <small v-if="v$.oldPassword.$error" class="text-red-500">
                    {{ v$.oldPassword.$errors[0].$message }}
                </small>
            </div>

            <!-- Nueva Contraseña -->
            <div class="flex flex-col">
                <label for="newPassword" class="text-sm font-semibold"> Nueva Contraseña <span class="text-red-500">*</span> </label>
                <div class="relative">
                    <input
                        :type="showNewPassword ? 'text' : 'password'"
                        v-model="formData.newPassword"
                        id="newPassword"
                        class="w-full p-2 border rounded-md pr-10"
                        :class="{ 'border-red-500': v$.newPassword.$error }"
                        @blur="v$.newPassword.$touch()"
                    />
                    <button type="button" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" @click="togglePassword('new')">
                        <i :class="['pi', showNewPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </button>
                </div>
                <small v-if="v$.newPassword.$error" class="text-red-500">
                    {{ v$.newPassword.$errors[0].$message }}
                </small>
            </div>

            <!-- Confirmar Contraseña -->
            <div class="flex flex-col">
                <label for="confirmPassword" class="text-sm font-semibold"> Confirmar Contraseña <span class="text-red-500">*</span> </label>
                <div class="relative">
                    <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        v-model="formData.confirmPassword"
                        id="confirmPassword"
                        class="w-full p-2 border rounded-md pr-10"
                        :class="{ 'border-red-500': v$.confirmPassword.$error }"
                        @blur="v$.confirmPassword.$touch()"
                    />
                    <button type="button" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" @click="togglePassword('confirm')">
                        <i :class="['pi', showConfirmPassword ? 'pi-eye-slash' : 'pi-eye']"></i>
                    </button>
                </div>
                <small v-if="v$.confirmPassword.$error" class="text-red-500">
                    {{ v$.confirmPassword.$errors[0].$message }}
                </small>
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" class="hover:bg-gray-400 text-black py-2 px-4 rounded-lg transition" @click="hideDialog" />
                <Button label="Guardar" class="hover:gray-400 text-white py-2 px-4 rounded-lg transition" :disabled="v$.$invalid" :loading="loading" @click="savePassword" />
            </div>
        </div>
    </Dialog>
</template>
