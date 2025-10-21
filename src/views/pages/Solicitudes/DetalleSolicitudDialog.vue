<script setup>
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/index';
import http from '@/plugins/axios';
import { formatDate, formatDateTime } from '@/helpers/dateUtils';
import { decimal } from '@vuelidate/validators';

const props = defineProps({
    visible: { type: Boolean, required: true },
    solicitud: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:visible', 'descargar', 'subir', 'editar', 'eliminarArchivo']);

const authStore = useAuthStore();

// Estado local para las imágenes
const dressImageSrc = ref(null);
const comprobanteImageSrc = ref(null);
const facturaImageSrc = ref(null);
const loadingImages = ref(false);

// Computed
const isAdmin = computed(() => {
    const adminRoles = ['admin', 'administrador'];
    const rolNormalizado = authStore.rol?.toLowerCase() || '';
    return adminRoles.includes(rolNormalizado);
});

const canEdit = computed(() => {
    if (!props.solicitud) return false;
    if (isAdmin.value) return true;
    return props.solicitud.usuario?.id === authStore.userId && props.solicitud.estado === 'pendiente';
});

const canDeleteFiles = computed(() => {
    if (!props.solicitud) return false;
    if (isAdmin.value) return true;
    return props.solicitud.usuario?.id === authStore.userId && props.solicitud.estado === 'pendiente';
});

// Utilidades de archivos
const getFileExtension = (filename) => (!filename ? '' : filename.split('.').pop().toLowerCase());
const isImageFile = (filename) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getFileExtension(filename));
const isPdfFile = (filename) => getFileExtension(filename) === 'pdf';

// Abrir en nueva pestaña
const openFileInNewWindow = async (id, type) => {
    try {
        const res = await http.get(`/solicitudes/${id}/${type}/view`, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
        console.error('No se pudo abrir el archivo:', err);
    }
};

// Cargar imágenes como blob URLs
const loadImageAsBlob = async (id, type) => {
    try {
        const response = await http.get(`/solicitudes/${id}/${type}/view`, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error(`Error loading ${type} image:`, error);
        return null;
    }
};

// Cargar imágenes cuando cambie la solicitud
watch(
    () => props.solicitud,
    async (newSolicitud) => {
        comprobanteImageSrc.value = null;
        facturaImageSrc.value = null;
        dressImageSrc.value = null;
        loadingImages.value = true;
        try {
            if (!newSolicitud?.id) {
                loadingImages.value = false;
                return;
            }
            if (newSolicitud.comprobantePago && isImageFile(newSolicitud.comprobantePago)) {
                comprobanteImageSrc.value = await loadImageAsBlob(newSolicitud.id, 'comprobante');
            } else comprobanteImageSrc.value = null;

            if (newSolicitud.factura && isImageFile(newSolicitud.factura)) {
                facturaImageSrc.value = await loadImageAsBlob(newSolicitud.id, 'factura');
            } else facturaImageSrc.value = null;

            if (newSolicitud.dress && isImageFile(newSolicitud.dress)) {
                dressImageSrc.value = await loadImageAsBlob(newSolicitud.id, 'dress');
            } else dressImageSrc.value = null;
        } catch {
            comprobanteImageSrc.value = null;
            facturaImageSrc.value = null;
            dressImageSrc.value = null;
        } finally {
            loadingImages.value = false;
        }
    },
    { immediate: true }
);

// Helpers visuales
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

const formatDetalleCalculo = (detalle) => {
    try {
        if (typeof detalle === 'string') return JSON.stringify(JSON.parse(detalle), null, 2);
        return JSON.stringify(detalle, null, 2);
    } catch (e) {
        return detalle;
    }
};

const parseDetalleCalculo = (detalle) => {
    try {
        if (typeof detalle === 'string') return JSON.parse(detalle);
        return detalle;
    } catch {
        return null;
    }
};

const formatNumber = (num, decimals = 2) => Number(num).toFixed(decimals);

const formatCurrency = (value) => {
    if (!value) return 'Bs. 0.00';
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :modal="true" :style="{ width: '1080px', maxWidth: '95vw' }" header="Detalles de la Solicitud" class="p-fluid detail-dialog">
        <div v-if="solicitud" class="layout">
            <!-- Sidebar fija (resumen) -->
            <aside class="sidebar">
                <div class="resume-card">
                    <div class="id-row">
                        <div class="avatar">
                            <i class="pi pi-file text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="heading">Solicitud #{{ solicitud.id }}</h2>
                            <div class="chips">
                                <Tag :value="solicitud.tipo" :class="getTipoClass(solicitud.tipo)" />
                                <Tag :value="solicitud.estado" :class="getEstadoClass(solicitud.estado)" />
                            </div>
                        </div>
                    </div>

                    <div class="money">
                        <span class="label">Total a pagar</span>
                        <span class="amount">{{ formatCurrency(solicitud.totalFinalBs) }}</span>
                    </div>

                    <div class="resume-grid">
                        <div class="r-item">
                            <span class="r-label">BL</span>
                            <span class="r-value">{{ solicitud.bl || '—' }}</span>
                        </div>
                        <div class="r-item">
                            <span class="r-label">Contenedor</span>
                            <span class="r-value">{{ solicitud.contenedor || '—' }}</span>
                        </div>
                        <div class="r-item">
                            <span class="r-label">Naviera</span>
                            <span class="r-value">{{ solicitud.naviera?.nombre || 'N/A' }}</span>
                        </div>
                        <div class="r-item">
                            <span class="r-label">Usuario</span>
                            <span class="r-value">{{ solicitud.usuario?.usuario || 'N/A' }}</span>
                        </div>
                    </div>

                    <div class="timeline">
                        <div class="t-row">
                            <i class="pi pi-calendar-plus"></i>
                            <div>
                                <div class="t-title">Creación</div>
                                <div class="t-date">{{ formatDate(solicitud.fechaCreacion) }}</div>
                                <small class="t-sub">{{ formatDateTime(solicitud.fechaCreacion) }}</small>
                            </div>
                        </div>
                        <div class="t-row">
                            <i class="pi pi-pencil"></i>
                            <div>
                                <div class="t-title">Última modificación</div>
                                <div class="t-date">{{ formatDate(solicitud.fechaModificacion) }}</div>
                                <small class="t-sub">{{ formatDateTime(solicitud.fechaModificacion) }}</small>
                            </div>
                        </div>
                    </div>

                    <div class="actions">
                        <Button label="Cerrar" icon="pi pi-times" class="p-button-outlined w-full" @click="$emit('update:visible', false)" />
                        <Button v-if="canEdit" label="Editar Solicitud" icon="pi pi-pencil" class="p-button-warning w-full" @click="$emit('editar', solicitud)" />
                    </div>
                </div>
            </aside>

            <!-- Contenido principal -->
            <main class="content">
                <TabView>
                    <TabPanel header="Resumen">
                        <div class="cards-grid">
                            <!-- KPIs financieros -->
                            <div class="card kpi">
                                <div class="kpi-title">Monto base</div>
                                <div class="kpi-value">
                                    {{
                                        (solicitud.tipo || '').toLowerCase() === 'gatein'
                                            ? new Intl.NumberFormat('es-BO', {
                                                  style: 'currency',
                                                  currency: 'CLP',
                                                  minimumFractionDigits: 0,
                                                  maximumFractionDigits: 0
                                              }).format((parseDetalleCalculo(solicitud.detalleCalculo) || {}).montoBaseCLP ?? solicitud.montoBase)
                                            : new Intl.NumberFormat('es-BO', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                                  minimumFractionDigits: 0,
                                                  maximumFractionDigits: 0
                                              }).format((parseDetalleCalculo(solicitud.detalleCalculo) || {}).montoUSD ?? solicitud.montoBase)
                                    }}
                                </div>
                                <div class="kpi-hint">
                                    {{ (solicitud.tipo || '').toLowerCase() === 'gatein' ? 'En CLP' : 'En USD' }}
                                </div>
                            </div>

                            <div class="card kpi">
                                <div class="kpi-title">Comisión</div>
                                <div class="kpi-value">{{ Number((parseDetalleCalculo(solicitud.detalleCalculo) || {}).comisionPorcentaje ?? solicitud.comisionPorcentaje ?? 0).toFixed(2) }}%</div>
                                <div class="kpi-hint">
                                    Monto:
                                    {{
                                        (solicitud.tipo || '').toLowerCase() === 'gatein'
                                            ? formatCurrency((parseDetalleCalculo(solicitud.detalleCalculo) || {}).comisionMonto ?? solicitud.comisionMonto)
                                            : new Intl.NumberFormat('es-BO', {
                                                  style: 'currency',
                                                  currency: 'USD',
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2
                                              }).format((parseDetalleCalculo(solicitud.detalleCalculo) || {}).comisionUSD ?? solicitud.comisionMonto)
                                    }}
                                </div>
                            </div>
                            <div class="card kpi">
                                <div class="kpi-title">Tipo de cambio</div>
                                <div class="kpi-value">
                                    {{ solicitud.tipo === 'gatein' ? (solicitud.tipoCambioUsado ? Number(solicitud.tipoCambioUsado).toFixed(2) : '—') : solicitud.tipoCambioUsado ? Number(solicitud.tipoCambioUsado).toFixed(2) : '—' }}
                                </div>
                                <div class="kpi-hint">{{ solicitud.tipo === 'gatein' ? 'Bs / CLP' : 'Bs / USD' }}</div>
                            </div>

                            <!-- Datos clave en tarjetas -->
                            <div class="card info">
                                <i class="pi pi-info-circle card-icon"></i>
                                <div class="info-list">
                                    <div class="info-row">
                                        <span>BL</span><strong>{{ solicitud.bl || '—' }}</strong>
                                    </div>
                                    <div class="info-row">
                                        <span>Contenedor</span><strong>{{ solicitud.contenedor || '—' }}</strong>
                                    </div>
                                    <div class="info-row">
                                        <span>Tipo</span><strong>{{ solicitud.tipo }}</strong>
                                    </div>
                                    <div class="info-row"><span>Estado</span><Tag :value="solicitud.estado" :class="getEstadoClass(solicitud.estado)" /></div>
                                </div>
                            </div>

                            <div class="card note" v-if="solicitud.observacion">
                                <i class="pi pi-comment card-icon"></i>
                                <div>
                                    <div class="note-title">Observación</div>
                                    <p class="note-text">{{ solicitud.observacion }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Cálculo (compacto) -->
                        <div class="card formula">
                            <div class="formula-head">
                                <i class="pi pi-calculator"></i>
                                <h4>Cálculo {{ parseDetalleCalculo(solicitud.detalleCalculo)?.tipo || solicitud.tipo }}</h4>
                            </div>

                            <template v-if="solicitud.detalleCalculo && parseDetalleCalculo(solicitud.detalleCalculo)">
                                <!-- GATEIN -->
                                <div v-if="parseDetalleCalculo(solicitud.detalleCalculo).tipo === 'GATEIN'" class="steps">
                                    <div class="step">
                                        {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).tarifaBase, 0) }} + {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).incremento, 0) }} =
                                        <strong>{{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).montoBaseCLP, 0) }}</strong
                                        ><small>CLP Base + servicio = Monto total CLP</small>
                                    </div>
                                    <div class="step">
                                        {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).montoBaseCLP, 0) }} × {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).tipoCambioCLP / 1000, 5) }} =
                                        <strong>{{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).valorBs) }}</strong
                                        ><small>Monto total CLP × Tipo de Cambio = Monto Bs</small>
                                    </div>
                                    <div class="step">
                                        {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).valorBs) }} × {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).comisionPorcentaje / 100, 3) }} =
                                        <strong>{{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).comisionMonto) }}</strong
                                        ><small>Monto Bs × Comisión % = Comisión bs</small>
                                    </div>
                                    <div class="step final">
                                        {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).valorBs) }} + {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).comisionMonto) }} =
                                        <strong>{{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).totalFinal) }}</strong
                                        ><small>Monto Bs + Comisión bs = Total a pagar bs</small>
                                    </div>
                                </div>

                                <!-- DEMORA / LIBERACION -->
                                <div v-else-if="['demora', 'liberacion'].includes(parseDetalleCalculo(solicitud.detalleCalculo).tipo?.toLowerCase?.() || '')" class="steps">
                                    <div class="step">
                                        ${{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).montoUSD, 0) }} × {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).comisionPorcentaje / 100, 3) }} =
                                        <strong>${{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).comisionUSD) }}</strong
                                        ><small>USD base× Comisión = Comisión USD</small>
                                    </div>
                                    <div class="step">
                                        ${{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).comisionUSD) }} + ${{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).montoUSD, 0) }} =
                                        <strong>${{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).totalUSD) }}</strong
                                        ><small>Comisión USD + USD base = total USD</small>
                                    </div>
                                    <div class="step">
                                        ${{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).totalUSD) }} × {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).tipoCambioUSD) }} =
                                        <strong>{{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).montoBaseBs) }}</strong
                                        ><small> total USD × Tipo de Cambio =  Monto Bs</small>
                                    </div>
                                    <div class="step final">
                                        {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).montoBaseBs) }} + {{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).incremento, 0) }} =
                                        <strong>{{ formatNumber(parseDetalleCalculo(solicitud.detalleCalculo).totalFinal) }}</strong
                                        ><small> Monto bs + Transporte =   Total a pagar Bs</small>
                                    </div>
                                </div>

                                <div v-else class="unknown">
                                    <h5>Tipo de cálculo: {{ parseDetalleCalculo(solicitud.detalleCalculo).tipo }}</h5>
                                    <pre>{{ formatDetalleCalculo(solicitud.detalleCalculo) }}</pre>
                                </div>
                            </template>

                            <template v-else>
                                <div class="steps">
                                    <div class="step">
                                        Monto Base: <strong>{{ formatCurrency(solicitud.montoBase) }}</strong
                                        ><small>Calculado según tipo</small>
                                    </div>
                                    <div class="step" v-if="solicitud.comisionPorcentaje && solicitud.comisionMonto">
                                        Comisión: <strong>{{ Number(solicitud.comisionPorcentaje).toFixed(2) }}% = {{ formatCurrency(solicitud.comisionMonto) }}</strong>
                                    </div>
                                    <div class="step final">
                                        Total Final: <strong>{{ formatCurrency(solicitud.totalFinalBs) }}</strong>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </TabPanel>

                    <TabPanel header="Documentos">
                        <div class="docs-grid">
                            <!-- DRESS -->
                            <div class="doc-card">
                                <div class="doc-head">
                                    <div class="doc-ico bg-yellow-50"><i class="pi pi-image text-yellow-600"></i></div>
                                    <div>
                                        <div class="doc-title">Archivo DRESS</div>
                                        <small class="doc-sub">Subido por el cliente</small>
                                    </div>
                                </div>

                                <template v-if="solicitud.dress">
                                    <div v-if="isImageFile(solicitud.dress)" class="doc-preview">
                                        <div v-if="loadingImages" class="loader"><ProgressSpinner style="width: 36px; height: 36px" /></div>
                                        <Image v-else-if="dressImageSrc" :src="dressImageSrc" :alt="`DRESS ${solicitud.id}`" preview class="img" />
                                    </div>

                                    <div v-else-if="isPdfFile(solicitud.dress)" class="file-pill">
                                        <i class="pi pi-file-pdf"></i>
                                        <span>Documento PDF</span>
                                        <small>{{ solicitud.dress }}</small>
                                    </div>

                                    <div v-else class="file-pill">
                                        <i class="pi pi-file"></i>
                                        <span>Archivo {{ getFileExtension(solicitud.dress).toUpperCase() }}</span>
                                        <small>{{ solicitud.dress }}</small>
                                    </div>

                                    <div class="doc-actions">
                                        <Button v-if="isPdfFile(solicitud.dress) || !isImageFile(solicitud.dress)" label="Ver" icon="pi pi-eye" class="p-button-outlined" @click="openFileInNewWindow(solicitud.id, 'dress')" />
                                        <Button label="Descargar" icon="pi pi-download" class="" @click="$emit('descargar', solicitud.id, 'dress')" />
                                    </div>
                                </template>

                                <div v-else class="empty">
                                    <i class="pi pi-upload"></i>
                                    <p>No hay archivo DRESS</p>
                                    <Button label="Subir DRESS" icon="pi pi-upload" class="p-button-outlined w-full" @click="$emit('subir', solicitud, 'dress')" />
                                </div>
                            </div>

                            <!-- Comprobante -->
                            <div class="doc-card">
                                <div class="doc-head">
                                    <div class="doc-ico bg-primary-50"><i class="pi pi-credit-card text-primary"></i></div>
                                    <div>
                                        <div class="doc-title">Comprobante de Pago</div>
                                        <small class="doc-sub">Subido por el cliente</small>
                                    </div>
                                </div>

                                <template v-if="solicitud.comprobantePago">
                                    <div v-if="isImageFile(solicitud.comprobantePago)" class="doc-preview">
                                        <div v-if="loadingImages" class="loader"><ProgressSpinner style="width: 36px; height: 36px" /></div>
                                        <Image v-else-if="comprobanteImageSrc" :src="comprobanteImageSrc" :alt="`Comprobante ${solicitud.id}`" preview class="img" />
                                    </div>

                                    <div v-else-if="isPdfFile(solicitud.comprobantePago)" class="file-pill">
                                        <i class="pi pi-file-pdf"></i>
                                        <span>Documento PDF</span>
                                        <small>{{ solicitud.comprobantePago }}</small>
                                    </div>

                                    <div v-else class="file-pill">
                                        <i class="pi pi-file"></i>
                                        <span>Archivo {{ getFileExtension(solicitud.comprobantePago).toUpperCase() }}</span>
                                        <small>{{ solicitud.comprobantePago }}</small>
                                    </div>

                                    <div class="doc-actions">
                                        <Button v-if="isPdfFile(solicitud.comprobantePago) || !isImageFile(solicitud.comprobantePago)" label="Ver" icon="pi pi-eye" class="p-button-outlined" @click="openFileInNewWindow(solicitud.id, 'comprobante')" />
                                        <Button label="Descargar" icon="pi pi-download" class="" @click="$emit('descargar', solicitud.id, 'comprobante')" />
                                        <Button v-if="canDeleteFiles" icon="pi pi-trash" severity="danger" class="p-button-outlined" v-tooltip.top="'Eliminar archivo'" @click="$emit('eliminarArchivo', solicitud.id, 'comprobantePago')" />
                                    </div>
                                </template>

                                <div v-else class="empty">
                                    <i class="pi pi-upload"></i>
                                    <p>No hay comprobante de pago</p>
                                    <Button label="Subir Comprobante" icon="pi pi-upload" class="p-button-outlined w-full" @click="$emit('subir', solicitud, 'comprobante')" />
                                </div>
                            </div>

                            <!-- Factura -->
                            <div class="doc-card">
                                <div class="doc-head">
                                    <div class="doc-ico bg-orange-50"><i class="pi pi-receipt text-orange-600"></i></div>
                                    <div>
                                        <div class="doc-title">Factura</div>
                                        <small class="doc-sub">Subido por administrador</small>
                                    </div>
                                </div>

                                <template v-if="solicitud.factura">
                                    <div v-if="isImageFile(solicitud.factura)" class="doc-preview">
                                        <div v-if="loadingImages" class="loader"><ProgressSpinner style="width: 36px; height: 36px" /></div>
                                        <Image v-else-if="facturaImageSrc" :src="facturaImageSrc" :alt="`Factura ${solicitud.id}`" preview class="img" />
                                    </div>

                                    <div v-else-if="isPdfFile(solicitud.factura)" class="file-pill">
                                        <i class="pi pi-file-pdf"></i>
                                        <span>Documento PDF</span>
                                        <small>{{ solicitud.factura }}</small>
                                    </div>

                                    <div v-else class="file-pill">
                                        <i class="pi pi-file"></i>
                                        <span>Archivo {{ getFileExtension(solicitud.factura).toUpperCase() }}</span>
                                        <small>{{ solicitud.factura }}</small>
                                    </div>

                                    <div class="doc-actions">
                                        <Button v-if="isPdfFile(solicitud.factura) || !isImageFile(solicitud.factura)" label="Ver" icon="pi pi-eye" class="p-button-outlined" @click="openFileInNewWindow(solicitud.id, 'factura')" />
                                        <Button label="Descargar" icon="pi pi-download" class="p-button-outlined" @click="$emit('descargar', solicitud.id, 'factura')" />
                                        <Button v-if="canDeleteFiles" icon="pi pi-trash" severity="danger" class="p-button-outlined" v-tooltip.top="'Eliminar archivo'" @click="$emit('eliminarArchivo', solicitud.id, 'factura')" />
                                    </div>
                                </template>

                                <div v-else class="empty">
                                    <i class="pi pi-upload"></i>
                                    <p>No hay factura</p>
                                    <div v-if="isAdmin" class="w-full">
                                        <Button label="Subir Factura" icon="pi pi-upload" class="p-button-outlined w-full" @click="$emit('subir', solicitud, 'factura')" />
                                    </div>
                                    <div v-else class="text-center">
                                        <i class="pi pi-lock text-gray-400 text-xl mb-2"></i>
                                        <p class="text-500 text-sm m-0">Solo administradores pueden subir facturas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </main>
        </div>

        <template #footer>
            <!-- Footer reducido porque las acciones están en el sidebar -->
            <small class="footer-hint">Revisa el panel izquierdo para acciones rápidas y resumen.</small>
        </template>
    </Dialog>
</template>

<style scoped>
:root {
    /* Suaves para tarjetas */
    --card-bg: #ffffff;
    --card-border: var(--surface-border);
    --muted: #6b7280;
    --title: #0f172a;
}

/* Disposición general: sidebar fijo + contenido scroll */
.layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1rem;
    min-height: 560px;
}

@media (max-width: 1024px) {
    .layout {
        grid-template-columns: 1fr;
    }
    .sidebar {
        position: static;
        top: auto;
    }
}

.sidebar {
    position: sticky;
    top: 0.25rem;
    align-self: start;
}

.resume-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(2, 8, 20, 0.04);
}

.id-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}
.avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    display: grid;
    place-items: center;
    background: #eef2ff;
    color: #4338ca;
}
.heading {
    margin: 0;
    font-weight: 800;
    letter-spacing: 0.2px;
}
.chips {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.money {
    text-align: left;
    margin: 0.75rem 0 1rem;
}
.money .label {
    color: var(--muted);
    font-size: 0.85rem;
}
.money .amount {
    display: block;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--primary-color);
}

.resume-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
}
.r-item {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.65rem;
    border: 1px dashed var(--surface-border);
    border-radius: 10px;
}
.r-label {
    color: var(--muted);
    font-size: 0.85rem;
}
.r-value {
    font-weight: 700;
}

.timeline {
    margin-top: 1rem;
    display: grid;
    gap: 0.75rem;
}
.t-row {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 0.75rem;
    align-items: start;
}
.t-title {
    font-weight: 700;
}
.t-date {
    margin-top: 0.1rem;
}
.t-sub {
    color: var(--muted);
}

.actions {
    margin-top: 1rem;
    display: grid;
    gap: 0.5rem;
}

/* Contenido */
.content {
    display: grid;
    gap: 1rem;
}

/* Grid de tarjetas responsivas */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
}

.card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(2, 8, 20, 0.04);
}

/* KPIs */
.kpi {
    text-align: center;
}
.kpi-title {
    color: var(--muted);
    font-size: 0.9rem;
}
.kpi-value {
    font-size: 1.4rem;
    font-weight: 800;
    margin-top: 0.25rem;
}
.kpi-hint {
    color: var(--muted);
    font-size: 0.8rem;
}

/* Card info */
.card-icon {
    font-size: 1.25rem;
    color: var(--primary-color);
}
.info .info-list {
    margin-top: 0.5rem;
    display: grid;
    gap: 0.5rem;
}
.info .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.65rem;
    background: #fafafa;
    border-radius: 10px;
}
.info .info-row span {
    color: var(--muted);
}

/* Notas */
.note {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 0.75rem;
}
.note-title {
    font-weight: 700;
    margin-bottom: 0.25rem;
}
.note-text {
    margin: 0;
    color: #374151;
}

/* Fórmula */
.card.formula {
    padding: 1.25rem;
    border: 1px solid var(--card-border);
    border-radius: 16px;
    background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}
.formula .formula-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--title);
}
.formula .formula-head i {
    opacity: 0.9;
}

.steps {
    display: grid;
    gap: 0.75rem;
    position: relative;
}
.steps:before {
    content: '';
    position: absolute;
    left: 14px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(#e5e7eb, #d1d5db);
    border-radius: 2px;
}

.step {
    position: relative;
    padding: 0.85rem 1rem 0.75rem 2.25rem;
    border: 1px solid #eef0f3;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(2, 8, 20, 0.04);
    font-variant-numeric: tabular-nums;
}
.step:before {
    content: '';
    position: absolute;
    left: 6px;
    top: 14px;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #fff 0 50%, transparent 51%), linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
    box-shadow: 0 0 0 3px #fff;
}

/* Expresión + resultado + hint (alineados en una fila) */
.step {
    display: flex;
    flex-wrap: wrap; /* el small baja */
    align-items: baseline;
    gap: 0.5rem;
    /* NUEVO: centra todo el renglón */
    justify-content: center;
    text-align: center;
}
.step .calculation-text {
    margin: 0;
    color: #0f172a;
    font-weight: 600;
    line-height: 1.25;
}
.step strong {
    margin-left: center; /* empuja el resultado a la derecha */
    font-size: 1.25rem;
    font-weight: 800;
    color: #111827;
    letter-spacing: 0.2px;
}
.step small {
    flex-basis: 100%; /* ocupa la línea inferior */
    margin-top: 0.2rem;
    color: var(--muted);
    font-style: italic;
}

/* Variante final */
.step.final {
    border: none;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 65%, #22c55e 100%);
    color: #fff;
    box-shadow: 0 8px 16px rgba(22, 163, 74, 0.25);
}
.step.final:before {
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0 50%, transparent 51%), linear-gradient(135deg, #ffffff, #dcfce7);
}
.step.final .calculation-text,
.step.final strong {
    color: #fff;
}
.step.final strong {
    font-size: 1.35rem;
}
.step.final small {
    color: rgba(255, 255, 255, 0.95);
}

/* Separadores suaves entre pasos */
.step + .step {
    border-top-left-radius: 10px;
}

/* Documentos */
.docs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}
.doc-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 1rem;
    display: grid;
    gap: 0.75rem;
}
.doc-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.doc-ico {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    display: grid;
    place-items: center;
}
.doc-title {
    font-weight: 700;
}
.doc-sub {
    color: var(--muted);
}

.doc-preview {
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}
.doc-preview .img {
    width: 100%;
    display: block;
}
.loader {
    display: grid;
    place-items: center;
    padding: 1.5rem;
}

.file-pill {
    display: grid;
    gap: 0.25rem;
    justify-items: start;
    border: 1px dashed var(--surface-border);
    border-radius: 10px;
    padding: 0.75rem;
}
.file-pill i {
    font-size: 1.2rem;
}

/* que los botones de acciones no se estiren ni en alto ni en ancho */
.doc-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;            /* alinea verticalmente */
}

.doc-actions .p-button.btn-download {
  flex: 0 0 auto !important;      /* evita que se estire */
  display: inline-flex;           /* tamaño natural */
  align-items: center;
  justify-content: center;
  height: 40px;                   /* altura consistente */
  min-width: 150px;               /* ancho mínimo común */
  padding: 0 16px;                /* padding horizontal */
  border-radius: 10px;            /* misma curvatura */
}


.empty {
    text-align: center;
    color: var(--muted);
    display: grid;
    place-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px dashed var(--surface-border);
    border-radius: 10px;
}

/* Dialog tweaks */
.detail-dialog :deep(.p-dialog-header) {
    border-bottom: 1px solid var(--surface-border);
}
.detail-dialog :deep(.p-tabview) {
    background: transparent;
    border: none;
}
.footer-hint {
    color: var(--muted);
}
</style>
