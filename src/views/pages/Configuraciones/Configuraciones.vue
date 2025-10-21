<script setup>
import { onMounted } from 'vue';
import { useConfiguraciones } from './useConfiguraciones';
import ChangeIndicator from './ChangeIndicator.vue';

const { configuracion, loading, saving, hasChanges, loadConfiguracion, saveConfiguracion, resetChanges, formatDate } = useConfiguraciones();

onMounted(async () => {
    await loadConfiguracion();
});
</script>

<template>
    <!-- Indicador de cambios flotante -->
    <ChangeIndicator :hasChanges="hasChanges" :saving="saving" @save="saveConfiguracion" />

    <div class="grid">
        <div class="col-12">
            <!-- Header con Skeleton mientras carga -->
            <div class="w-full">
                <div class="card w-full">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <div class="flex align-items-center gap-3">
                            <Avatar icon="pi pi-cog" class="p-avatar-circle" style="background-color: var(--primary-color); color: white" size="large" />
                            <div>
                                <h3 class="m-0 text-900">Configuraciones del Sistema</h3>
                                <p class="m-0 text-600">Gestiona los parámetros globales del sistema</p>
                            </div>
                        </div>
                        <div class="flex gap-2 ml-auto">
                            <Button v-if="hasChanges" label="Resetear" icon="pi pi-refresh" severity="secondary" outlined @click="resetChanges" :disabled="saving" />
                            <Button :label="configuracion.id ? 'Actualizar' : 'Crear'" :icon="configuracion.id ? 'pi pi-save' : 'pi pi-plus'" @click="saveConfiguracion" :loading="saving" :disabled="!hasChanges || loading" />
                        </div>
                    </div>

                    <!-- Estado de carga -->
                    <div v-if="loading" class="flex flex-column align-items-center justify-content-center py-8">
                        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
                        <p class="mt-4 text-600 font-medium">Cargando configuración...</p>
                    </div>

                    <!-- Contenido principal -->
                    <div v-else>
                        <!-- Contenedor principal con dos paneles lado a lado -->
                        <div class="grid panel-container w-full gap-3">
                            <!-- Panel principal del formulario - Izquierda -->
                            <div class="col-12 lg:col-8 pr-0 lg:pr-2">
                                <Panel header="Parámetros de Configuración" class="mb-4 h-full">
                                    <template #icons>
                                        <i class="pi pi-sliders-h text-primary"></i>
                                    </template>

                                    <div class="grid">
                                        <!-- Comisión -->
                                        <div class="col-12 md:col-6">
                                            <div class="flex flex-column gap-3 mb-4">
                                                <div class="input-row">
                                                    <label for="comisionPorcentaje" class="font-semibold text-900 label-desktop">
                                                        <i class="pi pi-percentage mr-2 text-primary"></i>
                                                        Comisión (%)
                                                    </label>
                                                    <InputNumber
                                                        id="comisionPorcentaje"
                                                        v-model="configuracion.comisionPorcentaje"
                                                        mode="decimal"
                                                        :min="0"
                                                        :max="100"
                                                        :minFractionDigits="2"
                                                        :maxFractionDigits="2"
                                                        suffix="%"
                                                        class="flex-1 input-uniform"
                                                        placeholder="Ej: 3.00"
                                                        showButtons
                                                        :step="0.01"
                                                    />
                                                </div>
                                                <small class="text-600">Porcentaje aplicado a las transacciones</small>
                                            </div>
                                        </div>

                                        <!-- Tipo de Cambio USD -->
                                        <div class="col-12 md:col-6">
                                            <div class="flex flex-column gap-3 mb-4">
                                                <div class="input-row">
                                                    <label for="tipoCambioUSD" class="font-semibold text-900 label-desktop">
                                                        <i class="pi pi-dollar mr-2 text-green-500"></i>
                                                        Tipo de Cambio USD
                                                    </label>
                                                    <InputNumber
                                                        id="tipoCambioUSD"
                                                        v-model="configuracion.tipoCambioUSD"
                                                        mode="decimal"
                                                        :min="0"
                                                        :minFractionDigits="2"
                                                        :maxFractionDigits="4"
                                                        prefix="$"
                                                        class="flex-1 input-uniform"
                                                        placeholder="Ej: 6.96"
                                                        showButtons
                                                        :step="0.01"
                                                    />
                                                </div>
                                                <small class="text-600">Valor del dólar estadounidense</small>
                                            </div>
                                        </div>

                                        <!-- Tipo de Cambio CLP -->
                                        <div class="col-12 md:col-6">
                                            <div class="flex flex-column gap-3 mb-4">
                                                <div class="input-row">
                                                    <label for="tipoCambioCLP" class="font-semibold text-900 label-desktop">
                                                        <i class="pi pi-chart-line mr-2 text-orange-500"></i>
                                                        Tipo de Cambio CLP
                                                    </label>
                                                    <InputNumber
                                                    id="tipoCambioCLP"
                                                    v-model="configuracion.tipoCambioCLP"
                                                    mode="decimal"
                                                    :min="0"
                                                    :minFractionDigits="2"  
                                                    :maxFractionDigits="6"
                                                    prefix="$"
                                                    class="flex-1 input-uniform"
                                                    placeholder="Ej: 0.00800"
                                                    showButtons
                                                    :step="0.00001"
                                                    />

                                                </div>
                                                <small class="text-600">Valor del peso chileno</small>
                                            </div>
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            <!-- Panel de información importante - Derecha -->
                            <div class="col-12 lg:col-4 pl-0 lg:pl-2">
                                <Panel header="Información Importante" class="mb-4 h-full">
                                    <template #icons>
                                        <i class="pi pi-info-circle text-blue-500"></i>
                                    </template>

                                    <div class="flex flex-column gap-4">
                                        <Message severity="info" :closable="false">
                                            <template #messageicon>
                                                <i class="pi pi-exclamation-triangle"></i>
                                            </template>
                                            <div class="ml-2">
                                                <p class="m-0 font-medium">Impacto en el Sistema</p>
                                                <ul class="mt-2 mb-0 pl-3">
                                                    <li>La comisión afecta todas las transacciones</li>
                                                    <li>Los tipos de cambio son usados en conversiones</li>
                                                </ul>
                                            </div>
                                        </Message>

                                        <Message severity="warn" :closable="false">
                                            <template #messageicon>
                                                <i class="pi pi-clock"></i>
                                            </template>
                                            <div class="ml-2">
                                                <p class="m-0 font-medium">Recomendaciones</p>
                                                <ul class="mt-2 mb-0 pl-3">
                                                    <li>Actualiza los tipos de cambio regularmente</li>
                                                    <li>Revisa la comisión periódicamente</li>
                                                </ul>
                                            </div>
                                        </Message>
                                    </div>
                                </Panel>
                            </div>
                        </div>

                        <!-- Panel de información de fechas (abajo) -->
                        <div class="w-full">
                            <Panel v-if="configuracion.id" header="Información del Registro" class="mt-4">
                                <template #icons>
                                    <i class="pi pi-calendar text-cyan-500"></i>
                                </template>

                                <div class="grid">
                                    <div class="col-12 md:col-6">
                                        <div class="flex align-items-center gap-3 p-3 border-round surface-card">
                                            <div class="flex align-items-center justify-content-center w-3rem h-3rem border-round icon-container-green">
                                                <i class="pi pi-plus text-xl"></i>
                                            </div>
                                            <div>
                                                <p class="m-0 font-semibold text-900">Fecha de Creación</p>
                                                <p class="m-0 text-600">{{ formatDate(configuracion.fechaCreacion) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-6">
                                        <div class="flex align-items-center gap-3 p-3 border-round surface-card">
                                            <div class="flex align-items-center justify-content-center w-3rem h-3rem border-round icon-container-orange">
                                                <i class="pi pi-pencil text-xl"></i>
                                            </div>
                                            <div>
                                                <p class="m-0 font-semibold text-900">Última Modificación</p>
                                                <p class="m-0 text-600">
                                                    {{ configuracion.fechaModificacion ? formatDate(configuracion.fechaModificacion) : 'Nunca modificado' }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.max-w-4xl {
    max-width: 56rem;
}

.field {
    margin-bottom: 1.5rem;
}

/* Animaciones suaves */
.card {
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

/* Mejoras en los inputs */
:deep(.p-inputnumber-input) {
    text-align: center;
    font-weight: 600;
}

/* Mejoras en los paneles */
:deep(.p-panel .p-panel-header) {
    background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%);
    border-bottom: 1px solid var(--surface-200);
}

:deep(.p-panel .p-panel-content) {
    padding: 1.5rem;
}

/* Efectos hover en botones */
:deep(.p-button) {
    transition: all 0.2s ease;
}

:deep(.p-button:hover:not(:disabled)) {
    transform: translateY(-1px);
}

/* Mejoras en avatars */
.p-avatar {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Mejoras en mensajes */
:deep(.p-message) {
    border-left: 4px solid var(--primary-color);
}

:deep(.p-message.p-message-info) {
    border-left-color: var(--blue-500);
}

:deep(.p-message.p-message-warn) {
    border-left-color: var(--orange-500);
}

/* Input rows - Desktop layout con labels inline */
.input-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.label-desktop {
    min-width: 180px;
    width: 180px;
    white-space: nowrap;
    flex-shrink: 0;
}

/* Altura igual para paneles lado a lado */
.h-full {
    height: 100%;
}

/* Asegurar que los paneles tengan la misma altura en desktop */
@media (min-width: 992px) {
    .panel-container {
        display: flex;
        align-items: stretch;
        width: 100%;
        max-width: none;
    }

    .panel-container .col-12 {
        display: flex;
        flex-direction: column;
    }

    .panel-container .p-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .panel-container :deep(.p-panel-content) {
        flex: 1;
    }
}

/* Responsive mejoras */
@media (max-width: 768px) {
    .flex.justify-content-between {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .flex.gap-2.ml-auto {
        margin-left: 0 !important;
        justify-content: center;
        width: 100%;
    }

    /* Botones en móvil ocupan todo el ancho */
    .flex.gap-2.ml-auto .p-button {
        flex: 1;
    }

    /* En móvil, los campos se apilan */
    .grid .col-12.md\\:col-6 {
        margin-bottom: 1rem;
    }

    /* En móvil, los paneles se apilan verticalmente */
    .grid .col-12.lg\\:col-8,
    .grid .col-12.lg\\:col-4 {
        margin-bottom: 1rem;
    }

    /* En móvil, cambiar a layout vertical */
    .input-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .label-desktop {
        min-width: auto;
        width: auto;
        white-space: normal;
        margin-bottom: 0.5rem;
    }

    /* Panel container sin gaps problemáticos en móvil */
    .panel-container {
        gap: 0 !important;
    }

    .panel-container .col-12 {
        padding: 0.5rem 0;
    }

    /* Ocultar textos de ayuda small en móvil */
    small {
        display: none !important;
    }
}

/* Mejoras para modo dark */
:deep(.p-panel .p-panel-header) {
    background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%);
    border-bottom: 1px solid var(--surface-200);
}

/* Iconos visibles en ambos temas */
.surface-card {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
}

/* Mejoras en los inputs */
:deep(.p-inputnumber-input) {
    text-align: center;
    font-weight: 600;
}

.input-uniform {
    flex: 1;
}

.icon-container-green {
    background-color: var(--green-100);
    color: var(--green-700);
}

.icon-container-orange {
    background-color: var(--orange-100);
    color: var(--orange-700);
}

/* En modo dark, ajustar colores de iconos */
:root[data-theme='dark'] .icon-container-green {
    background-color: var(--green-800);
    color: var(--green-200);
}

:root[data-theme='dark'] .icon-container-orange {
    background-color: var(--orange-800);
    color: var(--orange-200);
}

/* Prevenir overflow horizontal */
* {
    box-sizing: border-box;
}

.grid,
.col-12 {
    max-width: 100%;
    overflow-x: hidden;
}

/* Asegurar que los componentes no causen overflow */
:deep(.p-panel) {
    max-width: 100%;
    overflow: hidden;
}

:deep(.p-panel-content) {
    overflow-x: auto;
}

/* Mejorar espaciado general */
@media (max-width: 576px) {
    .card {
        margin: 0.5rem;
        padding: 1rem;
    }

    .mb-4 {
        margin-bottom: 1rem !important;
    }

    .gap-3 {
        gap: 1rem !important;
    }
}
</style>
