<script setup>
import { computed, ref, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { rolValidations } from './rolValidations';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    role: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save']);

const localRole = ref({
    nombre: '',
    descripcion: '',
    activo: true
});

const rules = computed(() => rolValidations);
const v$ = useVuelidate(rules, localRole);

watch(
    () => props.role,
    (newRole) => {
        localRole.value = { ...newRole };
    },
    { deep: true }
);

watch(
    () => props.visible,
    (newVisible) => {
        if (!newVisible) {
            localRole.value = {
                nombre: '',
                descripcion: '',
                activo: true
            };
            v$.value.$reset();
        }
    }
);

function hideDialog() {
    emit('update:visible', false);
}

async function saveRole() {
    const isFormValid = await v$.value.$validate();
    if (isFormValid) {
        emit('save', localRole.value);
        v$.value.$reset();
    } else {
        console.log('El formulario contiene errores');
    }
}
</script>

<template>
    <Dialog :visible="props.visible" class="p-6 bg-white rounded-lg shadow-lg w-[500px] max-w-full" :modal="true" :header="props.role.id ? 'Editar Rol' : 'Nuevo Rol'" @update:visible="(value) => emit('update:visible', value)">
        <div class="grid gap-4">
            <div class="flex flex-col">
                <label for="nombre" class="text-sm font-semibold"> Nombre <span class="text-red-500">*</span> </label>
                <InputText id="nombre" v-model="localRole.nombre" :class="['p-2 border rounded-md focus:ring-2 focus:ring-blue-500', { 'border-red-500': v$.nombre.$error }]" @blur="v$.nombre.$touch()" />
                <small v-if="v$.nombre.$error" class="text-red-500">
                    {{ v$.nombre.$errors[0].$message }}
                </small>
            </div>
            <div class="flex flex-col">
                <label for="descripcion" class="text-sm font-semibold"> Descripción </label>
                <Textarea id="descripcion" v-model="localRole.descripcion" :class="['p-2 border rounded-md focus:ring-2 focus:ring-blue-500', { 'border-red-500': v$.descripcion.$error }]" rows="3" @blur="v$.descripcion.$touch()" />
                <small v-if="v$.descripcion.$error" class="text-red-500">
                    {{ v$.descripcion.$errors[0].$message }}
                </small>
            </div>
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="localRole.activo" :default-value="false" />
                <label for="activo" class="text-sm font-semibold">Activo</label>
            </div>
            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" class="hover:bg-gray-400 text-black py-2 px-4 rounded-lg transition" @click="hideDialog" />
                <Button label="Guardar" class="hover:gray-400 text-white py-2 px-4 rounded-lg transition" :disabled="v$.$invalid" @click="saveRole" />
            </div>
        </div>
    </Dialog>
</template>
