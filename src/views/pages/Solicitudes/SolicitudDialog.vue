<script setup>
import { ref, watch, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { solicitudValidations } from './solicitudValidations';
import { useAuthStore } from '@/stores/index';
import { DOCUMENT_TYPES } from '@/constants/index';
import { Select } from 'primevue';

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    solicitud: {
        type: Object,
        default: () => ({})
    },
    navieras: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['update:visible', 'update:solicitud', 'guardar']);

// Store
const authStore = useAuthStore();

// Estado local
const solicitudLocal = ref({});

// Opciones
const tiposSolicitud = ref([
    { label: 'Gate In', value: 'gatein' },
    { label: 'Demora', value: 'demora' },
    { label: 'Liberación', value: 'liberacion' },
    //{ label: 'Giros', value: 'giros' }
]);

const documentTypes = DOCUMENT_TYPES;

const estadosSolicitud = ref([
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Subido', value: 'subido' },
    { label: 'Verificada', value: 'verificada' },
    { label: 'Pagada', value: 'pagada' },
    { label: 'Anulada', value: 'anulada' }
]);

// Computed
const isAdmin = computed(() => {
    const adminRoles = ['administrador']; // Usar solo 'administrador' que es el valor real del enum
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return adminRoles.includes(rolNormalizado);
});

const validationRules = computed(() => {
    const rules = { ...solicitudValidations };

    // Solo requerir monto si no es gatein
    if (solicitudLocal.value.tipo === 'gatein') {
        delete rules.monto;
    }

    return rules;
});

// Validaciones
const v$ = useVuelidate(validationRules, solicitudLocal);

// 🧠 Watchers
// Cuando cambia la solicitud (por ejemplo, al abrir "Editar")
watch(
  () => props.solicitud,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      // Intentar leer el detalleCalculo (puede venir como string o ya como objeto)
      let det = null;
      try {
        det =
          typeof newVal.detalleCalculo === 'string'
            ? JSON.parse(newVal.detalleCalculo || '{}')
            : newVal.detalleCalculo || null;
      } catch {
        det = null;
      }

      const tipo = String(newVal.tipo || '').toLowerCase();

      solicitudLocal.value = {
        ...newVal,
        // ✅ Pasar el ID de la naviera correctamente
        navieraId: newVal.naviera?.id || newVal.navieraId,
        // ✅ Prefill correcto del monto: usar montoUSD si existe (solo para demora/liberación)
        monto:
          (tipo === 'demora' || tipo === 'liberacion')
            ? (det?.montoUSD ?? newVal.monto ?? null)
            : null
      };
    } else {
      solicitudLocal.value = {};
    }
  },
  { immediate: true, deep: true }
);

// Mantén este watcher igual ⤵️
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      v$.value.$reset();
    }
  }
);


// Métodos

const formatCurrency = (value) => {
    if (!value) return 'Bs. 0.00';
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB'
    }).format(value);
};

const guardar = async () => {
    const isFormCorrect = await v$.value.$validate();

    if (!isFormCorrect) {
        return;
    }

    emit('guardar', { ...solicitudLocal.value });
};

const cancelar = () => {
    emit('update:visible', false);
    solicitudLocal.value = {};
    v$.value.$reset();
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :modal="true" :style="{ width: '700px' }" :header="solicitud.id ? 'Editar Solicitud' : 'Nueva Solicitud'" class="p-fluid">
        <form @submit.prevent="guardar">
            <div class="grid gap-4">
                <!-- BL y Contenedor -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label for="bl" class="text-sm font-semibold">BL</label>
                        <InputText id="bl" v-model="solicitudLocal.bl" placeholder="Ingrese el número de BL" class="p-2 border rounded-md" />
                    </div>

                    <div class="flex flex-col">
                        <label for="contenedor" class="text-sm font-semibold">Contenedor <span class="text-red-500">*</span></label>
                        <InputText id="contenedor" v-model="solicitudLocal.contenedor" placeholder="Ingrese el número de contenedor" class="p-2 border rounded-md" :class="{ 'border-red-500': v$.contenedor.$error }" @blur="v$.contenedor.$touch" />
                        <small v-if="v$.contenedor.$error" class="text-red-500">
                            {{ v$.contenedor.$errors[0].$message }}
                        </small>
                    </div>
                </div>

                <!-- Documento y Tipo Documento -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label for="documento" class="text-sm font-semibold">Documento</label>
                        <InputText id="documento" v-model="solicitudLocal.documento" placeholder="Ingrese el número de documento" class="p-2 border rounded-md" />
                    </div>

                    <div class="flex flex-col">
                        <label for="tipoDocumento" class="text-sm font-semibold">Tipo Documento</label>
                        <Select id="tipoDocumento" v-model="solicitudLocal.tipoDocumento" :options="documentTypes" optionLabel="label" optionValue="value" placeholder="Seleccione el tipo" class="p-column-filter w-full" />
                    </div>
                </div>

                <!-- Naviera y Tipo -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label for="naviera" class="text-sm font-semibold">Naviera <span class="text-red-500">*</span></label>
                        <Select
                            id="naviera"
                            v-model="solicitudLocal.navieraId"
                            :options="navieras"
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Seleccione una naviera"
                            class="p-column-filter w-full"
                            required
                            :class="{ 'border-red-500': v$.navieraId.$error }"
                            @blur="v$.navieraId.$touch()"
                        />
                        <small v-if="v$.navieraId.$error" class="text-red-500">
                            {{ v$.navieraId.$errors[0].$message }}
                        </small>
                    </div>

                    <div class="flex flex-col">
                        <label for="tipo" class="text-sm font-semibold">Tipo de Solicitud <span class="text-red-500">*</span></label>
                        <Select
                            id="tipo"
                            v-model="solicitudLocal.tipo"
                            :options="tiposSolicitud"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccione el tipo"
                            class="p-column-filter w-full"
                            required
                            :class="{ 'border-red-500': v$.tipo.$error }"
                            @blur="v$.tipo.$touch()"
                        />
                        <small v-if="v$.tipo.$error" class="text-red-500">
                            {{ v$.tipo.$errors[0].$message }}
                        </small>
                    </div>
                </div>

                <!-- Monto y Estado -->
                <div class="grid grid-cols-2 gap-4">
                    <!-- Monto (solo para tipos diferentes a gatein) -->
                    <div v-if="solicitudLocal.tipo && solicitudLocal.tipo !== 'gatein'" class="flex flex-col">
                        <label for="monto" class="text-sm font-semibold">Monto <span class="text-red-500">*</span></label>
                        <InputNumber
                            id="monto"
                            v-model="solicitudLocal.monto"
                            mode="currency"
                            currency="USD"
                            locale="es-BO"
                            :minFractionDigits="0"
                            :maxFractionDigits="2"
                            placeholder="0"
                            class="p-2 border rounded-md"
                            :class="{ 'border-red-500': v$.monto && v$.monto.$error }"
                            @blur="v$.monto && v$.monto.$touch"
                        />
                        <small v-if="v$.monto && v$.monto.$error" class="text-red-500">
                            {{ v$.monto.$errors[0].$message }}
                        </small>
                    </div>

                    <!-- Estado (solo para admin) -->
                    <div v-if="isAdmin && solicitudLocal.id" class="flex flex-col">
                        <label for="estado" class="text-sm font-semibold">Estado</label>
                        <Select id="estado" v-model="solicitudLocal.estado" :options="estadosSolicitud" optionLabel="label" optionValue="value" placeholder="Seleccione el estado" class="p-column-filter w-full" />
                    </div>
                </div>

                <!-- Total final calculado -->
                <div v-if="solicitudLocal.totalFinalBs" class="col-span-full">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mt-4">
                        <h5 class="text-blue-700 font-bold mb-2 text-lg">
                            <i class="pi pi-calculator mr-2"></i>
                            TOTAL FINAL
                        </h5>
                        <h2 class="text-blue-800 font-bold text-3xl m-0">
                            {{ formatCurrency(solicitudLocal.totalFinalBs) }}
                        </h2>
                        <small class="text-blue-600 mt-2 block">Monto calculado en bolivianos</small>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-4">
                    <Button label="Cancelar" class="hover:bg-gray-400 text-black py-2 px-4 rounded-lg transition" @click="cancelar" />
                    <Button label="Guardar" class="hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition" :loading="loading" @click="guardar" />
                </div>
            </div>
        </form>
    </Dialog>
</template>
