<script setup>
import { useVuelidate } from '@vuelidate/core';
import { computed, ref, watch } from 'vue';
import { navieraValidations } from './navieraValidations';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    naviera: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save']);

const localNaviera = ref({
    nombre: '',
    descripcion: '',
    activo: true
});

const rules = computed(() => navieraValidations);
const v$ = useVuelidate(rules, localNaviera);

watch(
  () => props.naviera,
  (newNaviera) => {
    localNaviera.value = { 
      ...newNaviera,
      activo: !!newNaviera?.activo   // <-- fuerza a boolean
    };
  },
  { deep: true }
);

watch(
    () => props.visible,
    (newVisible) => {
        if (!newVisible) {
            localNaviera.value = {
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

async function saveNaviera() {
    const isFormValid = await v$.value.$validate();

    if (isFormValid) {
        emit('save', localNaviera.value);
        v$.value.$reset();
    } else {
        console.log('El formulario contiene errores');
    }
}
</script>

<template>
    <Dialog :visible="props.visible" class="p-6 bg-white rounded-lg shadow-lg w-[500px] max-w-full" :modal="true" :header="props.naviera.id ? 'Editar Naviera' : 'Nueva Naviera'" @update:visible="(value) => emit('update:visible', value)">
        <div class="grid gap-4">
            <div class="flex flex-col">
                <label for="nombre" class="text-sm font-semibold">Nombre <span class="text-red-500">*</span></label>
                <InputText id="nombre" v-model="localNaviera.nombre" :class="['p-2 border rounded-md focus:ring-2 focus:ring-blue-500', { 'border-red-500': v$.nombre.$error }]" @blur="v$.nombre.$touch()" />
                <small v-if="v$.nombre.$error" class="text-red-500">
                    {{ v$.nombre.$errors[0].$message }}
                </small>
            </div>
            <div class="flex flex-col">
                <label for="descripcion" class="text-sm font-semibold">Descripción</label>
                <Textarea id="descripcion" v-model="localNaviera.descripcion" :class="['p-2 border rounded-md focus:ring-2 focus:ring-blue-500', { 'border-red-500': v$.descripcion.$error }]" rows="3" @blur="v$.descripcion.$touch()" />
                <small v-if="v$.descripcion.$error" class="text-red-500">
                    {{ v$.descripcion.$errors[0].$message }}
                </small>
            </div>
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="localNaviera.activo"/>
                <label for="activo" class="text-sm font-semibold">Activo</label>
            </div>
            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" class="hover:bg-gray-400 text-black py-2 px-4 rounded-lg transition" @click="hideDialog" />
                <Button label="Guardar" class="hover:gray-400 text-white py-2 px-4 rounded-lg transition" :disabled="v$.$invalid" @click="saveNaviera" />
            </div>
        </div>
    </Dialog>
</template>
