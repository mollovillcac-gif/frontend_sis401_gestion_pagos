<script setup>
import { SolicitudesService } from '@/service/SolicitudesService';
import { ref, onMounted } from 'vue';
import Toolbar from 'primevue/toolbar';
import PaginatorCommon from '@/components/PaginatorCommon.vue';
import SolicitudDialog from './SolicitudDialog.vue';
import UploadDialog from './UploadDialog.vue';
import DetalleSolicitudDialog from './DetalleSolicitudDialog.vue';
import EstadisticasDialog from './EstadisticasDialog.vue';
import { useSolicitudes } from './useSolicitudes';
import { useAuthStore } from '@/stores/index';
// import { DOCUMENT_TYPES } from '@/constants/index';
import { Select } from 'primevue';
import { formatDateTime } from '@/helpers/dateUtils';

// Composables
const {
    solicitudes,
    solicitud,
    navieras,
    loading,
    estadisticas,
    tiposSolicitud,
    estadosSolicitud,
    isAdmin,
    cargarSolicitudesHoy,
    cargarNavieras,
    cargarUsuarios,
    crearSolicitud,
    actualizarSolicitud,
    eliminarSolicitud,
    subirComprobante,
    subirFactura,
    descargarArchivo,
    eliminarArchivo,
    cargarEstadisticas
} = useSolicitudes();

const authStore = useAuthStore();

// Opciones
// const documentTypes = DOCUMENT_TYPES;

// Estado local
const showFilters = ref(true);
const solicitudDialog = ref(false);
const uploadDialog = ref(false);
const detalleDialog = ref(false);
const deleteDialog = ref(false);
const mostrarEstadisticas = ref(false);
const solicitudSeleccionada = ref({});
const tipoArchivoSeleccionado = ref('');

// Filtros
const filters = ref({
    page: 1,
    limit: 20,
    sord: 'DESC',
    sidx: 'id',
    id: null,
    bl: null,
    contenedor: null,
    documento: null,
    tipoDocumento: null,
    navieraId: null,
    tipo: null,
    estado: null,
    usuarioId: null,
    monto: null,
    fechaDesde: null,
    fechaHasta: null
});

const datatable = ref({
    total: 0
});

// Métodos
const cargarDatos = async () => {
    let filtrosParaEnviar;

    console.log('isAdmin:', isAdmin.value);
    console.log('authStore completo:', authStore);
    console.log('authStore.usuarioid:', authStore.usuarioid);
    console.log('authStore.user:', authStore.user);

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

    const result = await cargarSolicitudesHoy(filtrosParaEnviar);
    datatable.value.total = result.total || 0;
};

const abrirDialogoSolicitud = () => {
    solicitud.value = {};
    solicitudDialog.value = true;
};

const editarSolicitud = (data) => {
    solicitud.value = { ...data };
    solicitudDialog.value = true;
};

const guardarSolicitud = async (datos) => {
    try {
        if (datos.id) {
            await actualizarSolicitud(datos.id, datos);
        } else {
            await crearSolicitud(datos);
        }
        solicitudDialog.value = false;
        await cargarDatos();
    } catch (error) {
        // Error manejado en el composable
    }
};

const abrirDialogoArchivo = (solicitud, tipo) => {
    solicitudSeleccionada.value = solicitud;
    tipoArchivoSeleccionado.value = tipo;
    uploadDialog.value = true;
};

const subirArchivo = async (datos) => {
    try {
        if (datos.tipo === 'comprobante') {
            await subirComprobante(datos.solicitudId, datos.archivo);
        } else if (datos.tipo === 'factura') {
            await subirFactura(datos.solicitudId, datos.archivo);
        } else if (datos.tipo === 'dress') {
            await SolicitudesService.uploadDress(datos.solicitudId, datos.archivo);
        }
        uploadDialog.value = false;
        await cargarDatos();
    } catch (error) {
        // Error manejado en el composable
    }
};

const verDetalle = (data) => {
    solicitudSeleccionada.value = data;
    detalleDialog.value = true;
};

const confirmarEliminacion = (data) => {
    solicitudSeleccionada.value = data;
    deleteDialog.value = true;
};

const eliminarSolicitudConfirmada = async () => {
    try {
        await eliminarSolicitud(solicitudSeleccionada.value.id);
        deleteDialog.value = false;
        await cargarDatos();
    } catch (error) {
        // Error manejado en el composable
    }
};

const eliminarArchivoSolicitud = async (solicitudId, tipoArchivo) => {
    try {
        await eliminarArchivo(solicitudId, tipoArchivo);
        await cargarDatos();
        // Si el diálogo de detalles está abierto, actualizar los datos
        if (detalleDialog.value && solicitudSeleccionada.value.id === solicitudId) {
            const solicitudesActualizadas = solicitudes.value.find((s) => s.id === solicitudId);
            if (solicitudesActualizadas) {
                solicitudSeleccionada.value = { ...solicitudesActualizadas };
            }
        }
    } catch (error) {
        // Error manejado en el composable
    }
};

// Función para alternar filtros
const toggleFilters = () => {
    showFilters.value = !showFilters.value;
};

// Función para limpiar filtros
const clearFilters = () => {
    filters.value = {
        page: 1,
        limit: 20,
        sord: 'DESC',
        sidx: 'id',
        id: null,
        bl: null,
        contenedor: null,
        documento: null,
        tipoDocumento: null,
        navieraId: null,
        tipo: null,
        estado: null,
        usuarioId: null,
        monto: null,
        fechaDesde: null,
        fechaHasta: null
    };
    cargarDatos();
};

// Función para manejar cambios en filtros con debounce
let filterTimeout = null;
const onFilterChange = () => {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }
    filterTimeout = setTimeout(() => {
        filters.value.page = 1;
        if (filters.value.bl === '') filters.value.bl = null;
        if (filters.value.contenedor === '') filters.value.contenedor = null;
        if (filters.value.documento === '') filters.value.documento = null;
        if (filters.value.tipoDocumento === '') filters.value.tipoDocumento = null;
        if (filters.value.usuarioId === '') filters.value.usuarioId = null;
        cargarDatos();
    }, 300);
};

const onPageChange = (page) => {
    filters.value.page = page;
    cargarDatos();
};

// Funciones de utilidad
const formatCurrency = (value) => {
    if (!value) return 'Bs. 0.00';
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB'
    }).format(value);
};

const getTipoClass = (tipo) => {
    const classes = {
        gatein: 'p-tag-success',
        demora: 'p-tag-warning',
        liberacion: 'p-tag-info',
        giros: 'p-tag-help'
    };
    return classes[tipo] || '';
};

const getEstadoClass = (estado) => {
    const classes = {
        pendiente: 'p-tag-warning',
        subido: 'p-tag-info',
        verificada: 'p-tag-success',
        pagada: 'p-tag-success',
        anulada: 'p-tag-danger'
    };
    return classes[estado] || '';
};

// Funciones de permisos
const puedeEditar = (solicitud) => {
    if (isAdmin.value) return true;
    // Cliente solo puede editar si está pendiente y no ha subido comprobante
    return solicitud.estado === 'pendiente' && !solicitud.comprobantePago;
};

const puedeEliminar = (solicitud) => {
    if (isAdmin.value) return true;

    // Detectar el ID del usuario sin importar el nombre del campo
    const currentUserId =
        authStore.userId ??
        authStore.usuarioid ??
        authStore.user?.id ??
        null;

    // Permitir eliminar solo si la solicitud es del usuario actual y está pendiente
    return solicitud.usuario?.id === currentUserId && solicitud.estado === 'pendiente';
};

// Lifecycle
onMounted(async () => {
    await Promise.all([cargarNavieras(), cargarUsuarios(), cargarDatos(), cargarEstadisticas()]);
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <!-- Título para solicitudes de hoy -->
                <div class="mb-6">
                    <div class="flex p-4 border-round surface-border surface-card shadow-2">
                        <div class="flex">
                            <div>
                                <h1 class="text-3xl font-bold text-primary m-0 mb-2">Solicitudes de Hoy</h1>
                                <p class="text-600 m-0 text-sm">Gestiona las solicitudes creadas el día de hoy</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Header con botones -->
                <Toolbar class="mb-6">
                    <template #start>
                        <Button label="Nueva Solicitud" icon="pi pi-plus" severity="primary" class="mr-2" @click="abrirDialogoSolicitud" />
                        <Button v-if="isAdmin" label="Estadísticas" icon="pi pi-chart-bar" severity="info" class="mr-2" @click="mostrarEstadisticas = true" />
                    </template>
                    <template #end>
                        <Button :label="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'" :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'" severity="secondary" class="mr-2" @click="toggleFilters" />
                        <Button label="Limpiar Filtros" icon="pi pi-filter-slash" severity="secondary" @click="clearFilters" />
                    </template>
                </Toolbar>

                <!-- Tabla de solicitudes -->
                <DataTable :value="solicitudes" :loading="loading" dataKey="id" :filterDisplay="showFilters ? 'row' : 'menu'" showGridlines class="custom-small-table">
                    <template #empty>
                        <p class="text-center my-5">No se encontraron datos 🔎</p>
                    </template>
                    <!-- Indice columna -->
                    <Column header="#" style="max-width: 50px">
                        <template #body="slotProps">
                            {{ (filters.page - 1) * filters.limit + slotProps.index + 1 }}
                        </template>
                    </Column>

                    <Column field="usuario.usuario" header="Usuario" :showFilterMenu="false" v-if="isAdmin">
                        <template #filter>
                            <Select v-if="showFilters" v-model="filters.usuarioId" :options="usuarios" optionLabel="nombre" optionValue="id" placeholder="User" size="small" showClear @change="onFilterChange()" />
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.usuario?.nombre || 'N/A' }}
                        </template>
                    </Column>

                    <!-- Columnas con filtros -->
                    <Column field="bl" header="BL" :showFilterMenu="false" >
                        <template #filter>
                            <InputText v-if="showFilters" v-model.trim="filters.bl" type="text" class="p-inputtext-sm" placeholder="Buscar por BL" maxlength="30" @blur="filters.bl !== null ? onFilterChange() : null" />
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.bl ?? '-' }}
                        </template>
                    </Column>

                    <Column field="contenedor" header="Contenedor" :showFilterMenu="false">
                    <template #filter>
                        <InputText
                        v-if="showFilters"
                        v-model.trim="filters.contenedor"
                        type="text"
                        class="p-inputtext-sm w-full filtro-columna"
                        placeholder="Buscar contenedor"
                        maxlength="30"
                        @blur="filters.contenedor !== null ? onFilterChange() : null"
                        />
                    </template>
                    <template #body="slotProps">
                        {{ slotProps.data.contenedor ?? '-' }}
                    </template>
                    </Column>


                    <Column field="documento" header="Documento" :showFilterMenu="false">
                    <template #filter>
                        <InputText
                        v-if="showFilters"
                        v-model.trim="filters.documento"
                        type="text"
                        class="p-inputtext-sm w-full filtro-columna"
                        placeholder="Buscar documento"
                        maxlength="30"
                        @blur="filters.documento !== null ? onFilterChange() : null"
                        />
                    </template>
                    <template #body="slotProps">
                        {{ slotProps.data.documento ?? '-' }}
                    </template>
                    </Column>


                    <!-- <Column field="tipoDocumento" header="Tipo Documento" :showFilterMenu="false">
                        <template #filter>
                            <Select v-if="showFilters" v-model="filters.tipoDocumento" :options="documentTypes" optionLabel="label" optionValue="value" placeholder="Filtrar tipo" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                        </template>
                        <template #body="slotProps">
                            {{ documentTypes.find((type) => type.value === slotProps.data.tipoDocumento)?.label || slotProps.data.tipoDocumento }}
                        </template>
                    </Column> -->

                    <Column field="naviera.nombre" header="Naviera" :showFilterMenu="false">
                        <template #filter>
                            <Select v-if="showFilters" v-model="filters.navieraId" :options="navieras" optionLabel="nombre" optionValue="id" placeholder="Naviera" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.naviera?.nombre ?? '-' }}
                        </template>
                    </Column>

                    <Column field="tipo" header="Tipo" :showFilterMenu="false">
                        <template #filter>
                            <Select v-if="showFilters" v-model="filters.tipo" :options="tiposSolicitud" optionLabel="label" optionValue="value" placeholder="Tipo" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                        </template>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.tipo ?? '-'" :class="getTipoClass(slotProps.data.tipo)" />
                        </template>
                    </Column>

                    <Column field="totalFinalBs" header="Total (Bs)" :showFilterMenu="false">
                        <template #body="slotProps">
                            <span class="font-semibold">{{ slotProps.data.totalFinalBs != null ? formatCurrency(slotProps.data.totalFinalBs) : '-' }}</span>
                        </template>
                    </Column>

                    <Column field="estado" header="Estado" :showFilterMenu="false">
                        <template #filter>
                            <Select v-if="showFilters" v-model="filters.estado" :options="estadosSolicitud" optionLabel="label" optionValue="value" placeholder="Estado" class="p-column-filter w-full" @change="onFilterChange" size="small" />
                        </template>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.estado ?? '-'" :class="getEstadoClass(slotProps.data.estado)" />
                        </template>
                    </Column>

                    <Column field="fechaCreacion" header="Fecha y Hora" :showFilterMenu="false" style="width: 150px; text-align: center;">
                    <template #body="slotProps">
                        <div class="flex flex-col items-center">
                        <span>{{ new Date(slotProps.data.fechaCreacion).toLocaleDateString('es-BO') }}</span>
                        <span>{{ new Date(slotProps.data.fechaCreacion).toLocaleTimeString('es-BO') }}</span>
                        </div>
                    </template>
                    </Column>


                    <!-- Columna de archivos -->
                    <Column header="Archivos" style="min-width: 100px">
                        <template #body="slotProps">
                            <div class="flex gap-1">
                                <!-- Descargar DRESS -->
                                <Button v-if="slotProps.data.dress" icon="pi pi-image" class="p-button-rounded p-button-text p-button-sm" v-tooltip="'Descargar DRESS'" @click="descargarArchivo(slotProps.data.id, 'dress')" />
                                <!-- Descargar comprobante -->
                                <Button v-if="slotProps.data.comprobantePago" icon="pi pi-file" class="p-button-rounded p-button-text p-button-sm" v-tooltip="'Descargar comprobante'" @click="descargarArchivo(slotProps.data.id, 'comprobante')" />
                                <!-- Descargar factura -->
                                <Button v-if="slotProps.data.factura" icon="pi pi-file-pdf" class="p-button-rounded p-button-text p-button-sm" v-tooltip="'Descargar factura'" @click="descargarArchivo(slotProps.data.id, 'factura')" />
                                <!-- Subir DRESS (solo cliente, solo si no hay comprobante) -->
                                <Button
                                    v-if="!slotProps.data.comprobantePago && !slotProps.data.dress && !isAdmin"
                                    icon="pi pi-upload"
                                    class="p-button-rounded p-button-text p-button-sm p-button-warning"
                                    v-tooltip="'Subir DRESS'"
                                    @click="abrirDialogoArchivo(slotProps.data, 'dress')"
                                />
                                <!-- Subir comprobante (cliente o admin) -->
                                <Button
                                    v-if="!slotProps.data.comprobantePago && (slotProps.data.estado === 'pendiente' || isAdmin)"
                                    icon="pi pi-upload"
                                    class="p-button-rounded p-button-text p-button-sm p-button-help"
                                    v-tooltip="'Subir comprobante'"
                                    @click="abrirDialogoArchivo(slotProps.data, 'comprobante')"
                                />
                                <!-- Subir factura (solo admin) -->
                                <Button
                                    v-if="!slotProps.data.factura && slotProps.data.estado === 'verificada' && isAdmin"
                                    icon="pi pi-upload"
                                    class="p-button-rounded p-button-text p-button-sm p-button-success"
                                    v-tooltip="'Subir factura'"
                                    @click="abrirDialogoArchivo(slotProps.data, 'factura')"
                                />
                                <span v-if="!slotProps.data.comprobantePago && !slotProps.data.factura && !slotProps.data.dress && !(slotProps.data.estado === 'pendiente' || slotProps.data.estado === 'verificada' || isAdmin)">-</span>
                            </div>
                        </template>
                    </Column>

                    <!-- Columna de acciones -->
                    <Column header="Acciones" style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" outlined rounded class="mr-2" severity="info" @click="verDetalle(slotProps.data)" />
                            <Button v-if="puedeEditar(slotProps.data)" icon="pi pi-pencil" outlined rounded class="mr-2" @click="editarSolicitud(slotProps.data)" />
                            <Button v-if="puedeEliminar(slotProps.data)" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmarEliminacion(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <div class="flex justify-center mt-4">
                    <PaginatorCommon :filters="filters" :datatable="datatable" @eToPage="onPageChange" @eRefresh="cargarDatos" />
                </div>
            </div>
        </div>
    </div>

    <!-- Diálogo de solicitud -->
    <SolicitudDialog v-model:visible="solicitudDialog" v-model:solicitud="solicitud" :navieras="navieras" :loading="loading" @guardar="guardarSolicitud" />

    <!-- Diálogo de archivos -->
    <UploadDialog v-model:visible="uploadDialog" :solicitud="solicitudSeleccionada" :tipoArchivo="tipoArchivoSeleccionado" :loading="loading" @subir="subirArchivo" />

    <!-- Diálogo de detalles -->
    <DetalleSolicitudDialog v-model:visible="detalleDialog" :solicitud="solicitudSeleccionada" @descargar="descargarArchivo" @subir="abrirDialogoArchivo" @editar="editarSolicitud" @eliminarArchivo="eliminarArchivoSolicitud" />

    <!-- Diálogo de confirmación para eliminar -->
    <Dialog v-model:visible="deleteDialog" header="Confirmar eliminación" :modal="true" :style="{ width: '450px' }">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>¿Está seguro de que desea eliminar esta solicitud?</span>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
            <Button label="Eliminar" icon="pi pi-check" class="p-button-danger" @click="eliminarSolicitudConfirmada" />
        </template>
    </Dialog>

    <!-- Diálogo de estadísticas -->
    <EstadisticasDialog v-model:visible="mostrarEstadisticas" :estadisticas="estadisticas" />
</template>

<style scoped>
/* Ajustar padding general de celdas */
.custom-small-table :deep(.p-datatable-tbody > tr > td),
.custom-small-table :deep(.p-datatable-thead > tr > th) {
  padding: 0.5rem 0.6rem;
  text-align: center;
  vertical-align: middle;
  font-size: 1.05rem;
  box-sizing: border-box;
}

/* Columna # */
.custom-small-table :deep(th:nth-child(1)),
.custom-small-table :deep(td:nth-child(1)) {
  width: 50px;
  text-align: center;
}

/* Columna Usuario */
.custom-small-table :deep(th:nth-child(2)),
.custom-small-table :deep(td:nth-child(2)) {
  width: 120px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Columna BL */
.custom-small-table :deep(th:nth-child(3)),
.custom-small-table :deep(td:nth-child(3)) {
  min-width: 140px;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Columna Contenedor */
.custom-small-table :deep(th:nth-child(4)),
.custom-small-table :deep(td:nth-child(4)) {
  min-width: 120px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Columna Documento */
.custom-small-table :deep(th:nth-child(5)),
.custom-small-table :deep(td:nth-child(5)) {
  min-width: 120px;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* Columna Naviera */
.custom-small-table :deep(th:nth-child(6)),
.custom-small-table :deep(td:nth-child(6)) {
  width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Columna Tipo */
.custom-small-table :deep(th:nth-child(7)),
.custom-small-table :deep(td:nth-child(7)) {
  width: 100px;
}

/* Columna Total */
.custom-small-table :deep(th:nth-child(8)),
.custom-small-table :deep(td:nth-child(8)) {
  width: 130px;
}

/* Columna Estado */
.custom-small-table :deep(th:nth-child(9)),
.custom-small-table :deep(td:nth-child(9)) {
  width: 120px;
}

/* Columna Fecha y Hora */
.custom-small-table :deep(th:nth-child(10)),
.custom-small-table :deep(td:nth-child(10)) {
  width: 180px;
  white-space: nowrap;
}

/* Columna Archivos */
.custom-small-table :deep(th:nth-child(11)),
.custom-small-table :deep(td:nth-child(11)) {
  width: 120px;
}

/* Columna Acciones */
.custom-small-table :deep(th:nth-child(12)),
.custom-small-table :deep(td:nth-child(12)) {
  width: 120px;
}

/* 🔧 Fix: filtros de InputText y Select rellenan bien la celda */
.custom-small-table :deep(.p-column-filter .p-inputtext),
.custom-small-table :deep(.p-column-filter input),
.custom-small-table :deep(.p-column-filter .p-dropdown) {
  width: 100% !important;
  height: 100% !important;
  box-sizing: border-box;
  margin: 0;
  display: block;
}

</style>
