<script setup>
import { ref, onMounted, computed } from 'vue';
import PaginatorCommon from '@/components/PaginatorCommon.vue';
import DetalleSolicitudDialog from './DetalleSolicitudDialog.vue';
import { useAuthStore } from '@/stores/index';
import { SolicitudesService } from '@/service/SolicitudesService';
import { formatDateTime } from '@/helpers/dateUtils';
import { NavierasService } from '@/service/NavierasService';
import { UsuariosService } from '@/service/UsuariosService';

const authStore = useAuthStore();

// Estado local
const solicitudes = ref([]);
const loading = ref(false);
const showFilters = ref(true);
const detalleDialog = ref(false);
const solicitudSeleccionada = ref({});

// Filtros y paginación
const filters = ref({
    page: 1,
    limit: 20,
    sord: 'DESC',
    sidx: 'fechaCreacion',
    bl: null,
    contenedor: null,
    tipo: null,
    estado: null,
    documento: null,
    tipoDocumento: null,
    navieraId: null,
    usuarioId: null
});

const datatable = ref({ total: 0 });

// Computed
const isAdmin = computed(() => {
    const adminRoles = ['administrador'];
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return adminRoles.includes(rolNormalizado);
});

// Opciones para filtros
const tiposSolicitud = ref([
    { label: 'Todos', value: null },
    { label: 'Gate In', value: 'gatein' },
    { label: 'Demora', value: 'demora' },
    { label: 'Liberación', value: 'liberacion' },
    { label: 'Giros', value: 'giros' }
]);

const estadosSolicitud = ref([
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Subido', value: 'subido' },
    { label: 'Verificada', value: 'verificada' },
    { label: 'Pagada', value: 'pagada' },
    { label: 'Anulada', value: 'anulada' }
]);

const navieras = ref([]);
const usuarios = ref([]);

// Métodos
async function cargarHistorial() {
    loading.value = true;
    try {
        let filtrosParaEnviar;

        if (isAdmin.value) {
            // Si es admin, usar los filtros tal como están
            filtrosParaEnviar = filters.value;
        } else {
            // Si no es admin, forzar el filtro de usuarioId con el ID del usuario logueado
            filtrosParaEnviar = {
                ...filters.value,
                usuarioId: authStore.usuarioid
            };
        }

        const response = await SolicitudesService.getHistorial(filtrosParaEnviar);
        solicitudes.value = response.data.data;
        datatable.value.total = response.data.total;
    } catch (error) {
        console.error('Error al cargar historial:', error);
    } finally {
        loading.value = false;
    }
}

async function cargarNavieras() {
    try {
        const response = await NavierasService.getAll();
        navieras.value = [
            { label: 'Todas', value: null },
            ...response.data.data.map((naviera) => ({
                label: naviera.nombre,
                value: naviera.id
            }))
        ];
    } catch (error) {
        console.error('Error al cargar navieras:', error);
    }
}

async function cargarUsuarios() {
    if (!isAdmin.value) return; // Solo cargar usuarios si es admin

    try {
        const response = await UsuariosService.getAll();
        usuarios.value = [
            { label: 'Todos los usuarios', value: null },
            ...response.data.data.map((usuario) => ({
                label: usuario.nombre,
                value: usuario.id
            }))
        ];
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

function toggleFilters() {
    showFilters.value = !showFilters.value;
}

function clearFilters() {
    filters.value = {
        page: 1,
        limit: 20,
        sord: 'DESC',
        sidx: 'fechaCreacion',
        bl: null,
        contenedor: null,
        tipo: null,
        estado: null,
        documento: null,
        tipoDocumento: null,
        navieraId: null,
        usuarioId: isAdmin.value ? null : authStore.usuarioid
    };
    cargarHistorial();
}

function onFilterChange() {
    filters.value.page = 1;
    cargarHistorial();
}

function onPageChange(newPage) {
    filters.value.page = newPage;
    cargarHistorial();
}

function verDetalle(solicitud) {
    solicitudSeleccionada.value = solicitud;
    detalleDialog.value = true;
}

function getEstadoSeverity(estado) {
    switch (estado) {
        case 'pendiente':
            return 'warning';
        case 'subido':
            return 'info';
        case 'verificada':
            return 'success';
        case 'pagada':
            return 'success';
        case 'anulada':
            return 'danger';
        default:
            return 'secondary';
    }
}

function getTipoSeverity(tipo) {
    switch (tipo) {
        case 'gatein':
            return 'info';
        case 'demora':
            return 'warning';
        case 'liberacion':
            return 'success';
        case 'giros':
            return 'help';
        default:
            return 'secondary';
    }
}

// Montar componente
onMounted(() => {
    if (!isAdmin.value) {
        filters.value.usuarioId = authStore.usuarioid;
    }
    cargarHistorial();
    cargarNavieras();
    cargarUsuarios();
});
</script>

<template>
    <div class="card">
        <!-- Título para historial -->
        <div class="mb-6">
            <div class="flex p-4 border-round surface-border surface-card shadow-2">
                <div class="flexr">
                    <div>
                        <h1 class="text-3xl font-bold text-primary m-0 mb-2">Historial de Solicitudes</h1>
                        <p class="text-600 m-0 text-sm">Consulta todas las solicitudes pasadas</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <div class="mb-4">
            <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
            <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
        </div>

        <!-- Tabla de historial -->
        <DataTable :value="solicitudes" :loading="loading" dataKey="id" :filterDisplay="showFilters ? 'row' : 'menu'" :sortOrder="filters.sord === 'ASC' ? 1 : -1" :sortField="filters.sidx" showGridlines class="custom-small-table">
            <template #empty>
                <p class="text-center my-5">No se encontraron solicitudes en el historial 📋</p>
            </template>

            <!-- Índice -->
            <Column header="#" style="max-width: 50px">
                <template #body="slotProps">
                    {{ (filters.page - 1) * filters.limit + slotProps.index + 1 }}
                </template>
            </Column>

            <!-- BL -->
            <Column field="bl" header="BL" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.bl" type="text" class="p-inputtext-sm" placeholder="Buscar BL" @blur="filters.bl !== null ? onFilterChange() : null" />
                </template>
            </Column>

            <!-- Contenedor -->
            <Column field="contenedor" header="Contenedor" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.contenedor" type="text" class="p-inputtext-sm" placeholder="Buscar contenedor" @blur="filters.contenedor !== null ? onFilterChange() : null" />
                </template>
            </Column>

            <!-- Documento -->
            <Column field="documento" header="Documento" :showFilterMenu="false">
                <template #filter>
                    <InputText v-if="showFilters" v-model.trim="filters.documento" type="text" class="p-inputtext-sm" placeholder="Buscar documento" @blur="filters.documento !== null ? onFilterChange() : null" />
                </template>
            </Column>

            <!-- Naviera -->
            <Column field="naviera.nombre" header="Naviera" :showFilterMenu="false">
                <template #filter>
                    <Select v-if="showFilters" v-model="filters.navieraId" :options="navieras" optionLabel="label" optionValue="value" placeholder="Filtrar naviera" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.naviera?.nombre || '-' }}
                </template>
            </Column>

            <!-- Tipo -->
            <Column field="tipo" header="Tipo" :showFilterMenu="false">
                <template #filter>
                    <Select v-if="showFilters" v-model="filters.tipo" :options="tiposSolicitud" optionLabel="label" optionValue="value" placeholder="Filtrar tipo" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                </template>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.tipo" :severity="getTipoSeverity(slotProps.data.tipo)" class="text-xs" />
                </template>
            </Column>

            <!-- Estado -->
            <Column field="estado" header="Estado" :showFilterMenu="false">
                <template #filter>
                    <Select v-if="showFilters" v-model="filters.estado" :options="estadosSolicitud" optionLabel="label" optionValue="value" placeholder="Filtrar estado" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                </template>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" class="text-xs" />
                </template>
            </Column>

            <!-- Usuario (solo para admin) -->
            <Column v-if="isAdmin" field="usuario.nombre" header="Usuario" :showFilterMenu="false">
                <template #filter>
                    <Select v-if="showFilters" v-model="filters.usuarioId" :options="usuarios" optionLabel="label" optionValue="value" placeholder="Filtrar usuario" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.usuario?.nombre || '-' }}
                </template>
            </Column>

            <!-- Fecha de creación -->
            <Column field="fechaCreacion" header="Fecha Creación" :showFilterMenu="false">
                <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.fechaCreacion) }}
                </template>
            </Column>

            <!-- Total -->
            <Column field="totalFinalBs" header="Total (Bs)" :showFilterMenu="false">
                <template #body="slotProps">
                    {{ slotProps.data.totalFinalBs }}
                </template>
            </Column>

            <!-- Acciones -->
            <Column header="Acciones" style="min-width: 4rem">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="verDetalle(slotProps.data)" severity="info" size="small" />
                </template>
            </Column>
        </DataTable>

        <!-- Paginador -->
        <div class="flex justify-center mt-4">
            <PaginatorCommon :filters="filters" :datatable="datatable" @eToPage="onPageChange" @eRefresh="cargarHistorial" />
        </div>
    </div>

    <!-- Diálogo de detalle -->
    <DetalleSolicitudDialog v-model:visible="detalleDialog" :solicitud="solicitudSeleccionada" />
</template>

<style scoped>
.custom-small-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.1rem 0.3rem;
}

.custom-small-table :deep(.p-datatable-thead > tr > th) {
    padding: 0.1rem 0.3rem;
}
</style>
