<script setup lang="ts">
import PaginatorCommon from '@/components/PaginatorCommon.vue';
import ActivoTag from '@/components/ActivoTag.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '@/stores/index';

import { NavierasService } from '@/service/NavierasService';
import { TarifasService } from '../../../service/TarifasService';

import useVuelidate from '@vuelidate/core';
import { tarifaValidations } from './tarifaValidations';

// Instancia de toast para notificaciones
const toast = useToast();

const authStore = useAuthStore();

const isAdmin = computed(() => {
    const adminRoles = ['administrador'];
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return adminRoles.includes(rolNormalizado);
});

// Estado principal de la vista
const tarifas = ref([]);
const tarifa = ref({
    id: null,
    usuarioId: null,
    navieraId: null,
    montoBase: 0,
    activo: true
});
const navieras = ref([]);
const loading = ref(false);
const tarifaDialog = ref(false);
const deleteTarifaDialog = ref(false);
const showFilters = ref(true);
const datatable = ref({ total: 0 });

// Reglas de validación para el formulario de tarifa
const v$ = useVuelidate(tarifaValidations, tarifa);

// Filtros para la tabla de tarifas
const filters = ref({
    page: 1,
    limit: 20,
    sord: 'DESC',
    sidx: 'id',
    navieraId: null,
    montoOperador: null,
    montoValor: null,
    activo: null
});

// Filtros para navieras y productos
const filtersNav = ref({
    page: 1,
    limit: 20,
    sord: 'DESC',
    sidx: 'nombre',
    activo: true
});

// Cargar datos iniciales al montar el componente
onMounted(async () => {
    await Promise.all([getTarifas(), getNavieras()]);
});

// Obtener la lista de tarifas aplicando los filtros actuales
async function getTarifas() {
    loading.value = true;
    try {
        // Preparar los filtros para el backend
        const filtrosBackend = { ...filters.value };

        // Convertir el operador y valor a montoMinimo/montoMaximo
        if (filtrosBackend.montoValor !== null && filtrosBackend.montoValor !== undefined && filtrosBackend.montoValor !== '' && filtrosBackend.montoOperador) {
            if (filtrosBackend.montoOperador === '>=') {
                filtrosBackend['montoMinimo'] = filtrosBackend.montoValor;
            } else if (filtrosBackend.montoOperador === '<=') {
                filtrosBackend['montoMaximo'] = filtrosBackend.montoValor;
            } else if (filtrosBackend.montoOperador === '=') {
                filtrosBackend['montoMinimo'] = filtrosBackend.montoValor;
                filtrosBackend['montoMaximo'] = filtrosBackend.montoValor;
            }
        }

        // Eliminar los campos que no usa el backend
        delete filtrosBackend.montoOperador;
        delete filtrosBackend.montoValor;

        const response = await TarifasService.getAll(filtrosBackend);
        tarifas.value = response.data.data;
        datatable.value.total = response.data.total;
    } catch (error) {
        mostrarError('Error al cargar las tarifas', error.message);
    } finally {
        loading.value = false;
    }
}

// Obtener la lista de navieras activas
async function getNavieras() {
    try {
        const response = await NavierasService.getAll(filtersNav.value);
        navieras.value = response.data.data;
    } catch (error) {
        mostrarError('Error al cargar las navieras', error.message);
    }
}

// Crear un nuevo tarifa con los datos del formulario
async function createTarifa() {
    loading.value = true;
    try {
        const tarifaData = {
            usuarioId: authStore.usuarioid,
            navieraId: tarifa.value.navieraId,
            montoBase: tarifa.value.montoBase ? +tarifa.value.montoBase : 0,
            activo: tarifa.value.activo ?? true
        };

        await TarifasService.create(tarifaData);
        mostrarExito('Tarifa creada correctamente');
        hideDialog();
        await getTarifas();
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                const messages = Array.isArray(error.response.data.message) ? error.response.data.message.join(' | ') : error.response.data.message;
                mostrarAdvertencia(messages);
            } else if (error.response.status === 404) {
                mostrarError('Error al crear la tarifa', 'Recurso no encontrado');
            } else if (error.response.status === 409) {
                mostrarAdvertencia(error.response.data.message || 'Conflicto al crear la tarifa');
            } else {
                mostrarError('Error al crear la tarifa', 'Error desconocido');
            }
        } else {
            mostrarError('Error al crear la tarifa', 'Error desconocido');
        }
    } finally {
        loading.value = false;
    }
}

// Actualizar un tarifa existente
async function updateTarifa(id, tarifaData) {
    loading.value = true;
    try {
        const tarifaToUpdate = {
            usuarioId: authStore.usuarioid,
            navieraId: tarifaData.navieraId,
            montoBase: tarifaData.montoBase ? +tarifaData.montoBase : 0,
            activo: tarifaData.activo ?? true
        };

        await TarifasService.update(id, tarifaToUpdate);
        mostrarExito('Tarifa actualizada correctamente');
        hideDialog();
        await getTarifas();
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                const messages = Array.isArray(error.response.data.message) ? error.response.data.message.join(' | ') : error.response.data.message;
                mostrarAdvertencia(messages);
            } else if (error.response.status === 404) {
                mostrarError('Error al actualizar la tarifa', 'Recurso no encontrado');
            } else if (error.response.status === 409) {
                mostrarAdvertencia(error.response.data.message || 'Conflicto al actualizar la tarifa');
            } else {
                mostrarError('Error al actualizar la tarifa', 'Error desconocido');
            }
        } else {
            mostrarError('Error al actualizar la tarifa', 'Error desconocido');
        }
    } finally {
        loading.value = false;
    }
}

// Eliminar un tarifa seleccionado
async function deleteTarifa() {
    loading.value = true;
    try {
        await TarifasService.delete(tarifa.value.id);
        mostrarExito('Tarifa eliminada correctamente');
        deleteTarifaDialog.value = false;
        await getTarifas();
    } catch (error) {
        if (error.response && error.response.status === 409) {
            mostrarAdvertencia(error.response.data.message || 'No se puede eliminar la tarifa porque tiene dependencias relacionadas');
        } else {
            mostrarError('Error al eliminar la tarifa', error.response?.data?.message || 'Error desconocido');
        }
    } finally {
        loading.value = false;
        deleteTarifaDialog.value = false;
    }
}

// Guardar tarifa (crear o actualizar según corresponda)
async function saveTarifa() {
    const isFormValid = await v$.value.$validate();

    if (!isFormValid) {
        toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, corrija los errores del formulario', life: 5000 });
        return;
    }

    if (tarifa.value.id) {
        updateTarifa(tarifa.value.id, tarifa.value);
    } else {
        createTarifa();
    }
}

// Abrir el diálogo para crear un nuevo tarifa
function openNew() {
    tarifa.value = {
        id: null,
        usuarioId: null,   // 👈 agrega esta líne
        navieraId: null,
        montoBase: 0,
        activo: true
    };
    tarifaDialog.value = true;
    v$.value.$reset();
}

// Cerrar el diálogo de tarifa
function hideDialog() {
    tarifaDialog.value = false;
    v$.value.$reset();
}

// Preparar el formulario para editar un tarifa existente
function editTarifa(tarifaData) {
  tarifa.value = {
    id: tarifaData.id,
    usuarioId: tarifaData.usuarioId || authStore.usuarioid, // 👈 agrega esta línea
    navieraId: tarifaData.naviera?.id || tarifaData.navieraId,
    montoBase: tarifaData.montoBase,
    activo: tarifaData.activo
  };
  tarifaDialog.value = true;
}


// Mostrar diálogo de confirmación para eliminar tarifa
function confirmDeleteTarifa(tarifaData) {
    tarifa.value = tarifaData;
    deleteTarifaDialog.value = true;
}

// Alternar la visibilidad de los filtros en la tabla
function toggleFilters() {
    showFilters.value = !showFilters.value;
}

// Limpiar todos los filtros y recargar la tabla
function clearFilters() {
    filters.value = {
        page: 1,
        limit: 20,
        sord: 'DESC',
        sidx: 'id',
        navieraId: null,
        montoOperador: null,
        montoValor: null,
        activo: null
    };
    getTarifas();
}

// Cambiar de página en la tabla de tarifas
function onPageChange(event) {
    filters.value.page = event;
    getTarifas();
}

// Aplicar filtros y recargar la tabla
function onFilterChange() {
    // Si solo hay operador sin valor, limpiar el operador
    if (filters.value.montoOperador && (!filters.value.montoValor || filters.value.montoValor === 0)) {
        filters.value.montoOperador = null;
    }
    // Si solo hay valor sin operador, poner >= por defecto
    if (filters.value.montoValor && filters.value.montoValor > 0 && !filters.value.montoOperador) {
        filters.value.montoOperador = '>=';
    }
    // Si ambos están vacíos, asegurar que sean null
    if ((!filters.value.montoValor || filters.value.montoValor === 0) && !filters.value.montoOperador) {
        filters.value.montoOperador = null;
        filters.value.montoValor = null;
    }

    filters.value.page = 1;
    getTarifas();
}

// Notificación de éxito
function mostrarExito(mensaje) {
    toast.add({
        severity: 'success',
        summary: 'Operación exitosa',
        detail: mensaje,
        life: 5000
    });
}

// Notificación de error
function mostrarError(titulo, mensaje) {
    toast.add({
        severity: 'error',
        summary: titulo,
        detail: mensaje,
        life: 5000
    });
}

// Notificación de advertencia
function mostrarAdvertencia(mensaje) {
    toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: mensaje,
        life: 5000
    });
}
</script>

<template>
    <div class="card">
        <!-- Título para usuarios no admin -->
        <div v-if="!isAdmin" class="mb-6">
            <div class="flex p-4 border-round surface-border surface-card shadow-2">
                <div class="flex">
                    <div>
                        <h1 class="text-3xl font-bold text-primary m-0 mb-2">Tarifas Disponibles</h1>
                        <p class="text-600 m-0 text-sm">Consulta las tarifas para cada naviera</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toolbar solo para administradores -->
        <Toolbar v-if="isAdmin" class="mb-6">
            <template #start>
                <Button label="Nueva Tarifa" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
                <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
            </template>
        </Toolbar>

        <!-- Filtros básicos para usuarios no admin -->
        <div v-if="!isAdmin" class="mb-4">
            <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
            <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
        </div>

        <DataTable :value="tarifas" :loading="loading" dataKey="id" :filterDisplay="showFilters ? 'row' : 'menu'" :sortOrder="filters.sord === 'ASC' ? 1 : -1" :sortField="filters.sidx" showGridlines class="custom-small-table">
            <template #empty>
                <p class="text-center my-5">No se encontraron datos 🔎</p>
            </template>

            <!-- Índice columna -->
            <Column header="#" style="max-width: 50px">
                <template #body="slotProps">
                    {{ (filters.page - 1) * filters.limit + slotProps.index + 1 }}
                </template>
            </Column>

            <!-- Columna Naviera -->
            <Column field="naviera.nombre" header="Naviera" :showFilterMenu="false">
                <template #filter>
                    <Select v-if="showFilters" v-model="filters.navieraId" :options="navieras" optionLabel="nombre" optionValue="id" placeholder="Seleccionar naviera" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.naviera?.nombre || '-' }}
                </template>
            </Column>

            <!-- Columna Monto Base -->
            <Column field="montoBase" header="Monto Base" :showFilterMenu="false">
                <template #filter>
                    <div v-if="showFilters" class="flex gap-1">
                        <Select
                            v-model="filters.montoOperador"
                            :options="[
                                { label: '≥', value: '>=' },
                                { label: '≤', value: '<=' },
                                { label: '=', value: '=' }
                            ]"
                            optionLabel="label"
                            optionValue="value"
                            class="w-16"
                            size="small"
                            @change="onFilterChange"
                            @update:modelValue="onFilterChange"
                        />
                        <InputNumber
                            v-model="filters.montoValor"
                            placeholder="Valor"
                            class="flex-1"
                            size="small"
                            @blur="onFilterChange"
                            @update:modelValue="onFilterChange"
                            mode="decimal"
                            :minFractionDigits="0"
                            :maxFractionDigits="2"
                            :min="0"
                            :useGrouping="false"
                        />
                    </div>
                </template>
                <template #body="slotProps">
                {{ Math.round(slotProps.data.montoBase).toLocaleString('es-CL') }}
                </template>

            </Column>

            <!-- Columna Estado -->
            <Column field="activo" header="Estado" :showFilterMenu="false">
                <template #filter>
                    <Select
                        v-if="showFilters"
                        v-model="filters.activo"
                        :options="[
                            { label: 'Todos', value: null },
                            { label: 'Activo', value: true },
                            { label: 'Inactivo', value: false }
                        ]"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Filtrar estado"
                        class="p-column-filter w-full"
                        @change="onFilterChange"
                        size="small"
                    />
                </template>
                <template #body="slotProps">
                    <ActivoTag :isActive="slotProps.data.activo" />
                </template>
            </Column>

            <!-- Columna Acciones -->
            <Column v-if="isAdmin" header="Acciones" style="min-width: 8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editTarifa(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteTarifa(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <div class="flex justify-center mt-4">
            <PaginatorCommon :filters="filters" :datatable="datatable" @eToPage="onPageChange" @eRefresh="getTarifas" />
        </div>
    </div>

    <Dialog v-if="isAdmin" v-model:visible="tarifaDialog" class="p-6 bg-white rounded-lg shadow-lg w-[600px] max-w-full" :modal="true" :header="tarifa.id ? 'Editar Tarifa' : 'Nueva Tarifa'" @update:visible="(value) => !value && v$.$reset()">
        <div class="flex flex-col gap-4">
            <!-- Naviera -->
            <div class="flex flex-col">
                <label for="naviera" class="text-sm font-semibold">Naviera <span class="text-red-500">*</span></label>
                <Select
                    v-model="tarifa.navieraId"
                    :options="navieras"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccione naviera"
                    class="p-column-filter w-full"
                    :class="{ 'border-red-500': v$.navieraId.$error }"
                    @blur="v$.navieraId.$touch()"
                />
                <small v-if="v$.navieraId.$error" class="text-red-500">
                    {{ v$.navieraId.$errors[0].$message }}
                </small>
            </div>

            <!-- Monto Base -->
            <div class="flex flex-col">
                <label for="montoBase" class="text-sm font-semibold">Monto Base <span class="text-red-500">*</span></label>
                <InputNumber
                    v-model="tarifa.montoBase"
                    id="montoBase"
                    class="p-2 border rounded-md"
                    :class="{ 'border-red-500': v$.montoBase.$error }"
                    @blur="v$.montoBase.$touch()"
                    mode="currency"
                    currency="CLP"
                    currencyDisplay="symbol"
                    locale="es-CL"
                    :minFractionDigits="0"
                    :maxFractionDigits="0"
                />
                <small v-if="v$.montoBase.$error" class="text-red-500">
                    {{ v$.montoBase.$errors[0].$message }}
                </small>
            </div>

            <!-- Estado Activo -->
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="tarifa.activo" id="activo" />
                <label for="activo" class="text-sm font-semibold">Activo</label>
                <small v-if="v$.activo?.$error" class="text-red-500">
                    {{ v$.activo?.$errors[0].$message }}
                </small>
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancelar" class="hover:bg-gray-400 text-black py-2 px-4 rounded-lg transition" @click="hideDialog" />
                <Button label="Guardar" class="hover:gray-400 text-white py-2 px-4 rounded-lg transition" :disabled="v$.$invalid" @click="saveTarifa" />
            </div>
        </div>
    </Dialog>

    <Dialog v-if="isAdmin" v-model:visible="deleteTarifaDialog" :style="{ width: '450px' }" :modal="true" header="Confirmar eliminación">
        <div class="flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl"></i>
            <span>
                ¿Estás seguro de que quieres eliminar esta tarifa de <strong>CLP. {{ tarifa?.montoBase }}</strong
                >?
            </span>
        </div>
        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="deleteTarifaDialog = false" />
            <Button label="Eliminar" severity="danger" @click="deleteTarifa" />
        </template>
    </Dialog>
</template>

<style scoped>
.custom-small-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.1rem 0.3rem;
}

.custom-small-table :deep(.p-datatable-thead > tr > th) {
    padding: 0.1rem 0.3rem;
}
</style>
