<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

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
    tipoArchivo: {
        type: String,
        required: true,
        validator: (value) => ['comprobante', 'factura', 'dress'].includes(value)
    },
    loading: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['update:visible', 'subir']);

// Composables
const toast = useToast();

// Estado local
const archivoSeleccionado = ref(null);

// Computed
const getDialogTitle = () => {
    if (props.tipoArchivo === 'comprobante') return 'Subir Comprobante de Pago';
    if (props.tipoArchivo === 'factura') return 'Subir Factura';
    if (props.tipoArchivo === 'dress') return 'Subir DRESS';
    return '';
};

const getDescription = () => {
    if (props.tipoArchivo === 'comprobante') return `Subir comprobante para la solicitud #${props.solicitud.id}`;
    if (props.tipoArchivo === 'factura') return `Subir factura para la solicitud #${props.solicitud.id}`;
    if (props.tipoArchivo === 'dress') return `Subir DRESS para la solicitud #${props.solicitud.id}`;
    return '';
};

const getIconClass = () => {
    if (props.tipoArchivo === 'comprobante') return 'pi pi-credit-card';
    if (props.tipoArchivo === 'factura') return 'pi pi-file-pdf';
    if (props.tipoArchivo === 'dress') return 'pi pi-image';
    return '';
};

const getFileRequirements = () => {
    return 'Formatos aceptados: JPG, PNG, PDF | Tamaño máximo: 5MB';
};

const getAcceptedTypes = () => {
    return '.jpg,.jpeg,.png,.pdf';
};

// Métodos
const onFileSelect = (event) => {
    const file = event.files[0];

    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y PDF',
            life: 3000
        });
        return;
    }

    // Validar tamaño (5MB = 5,000,000 bytes)
    if (file.size > 5000000) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
            life: 3000
        });
        return;
    }

    archivoSeleccionado.value = file;
};

const onFileError = () => {
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al seleccionar el archivo',
        life: 3000
    });
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const limpiarArchivo = () => {
    archivoSeleccionado.value = null;
};

const mostrarConfirmacion = ref(false);

const subirArchivo = () => {
    if (!archivoSeleccionado.value) {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe seleccionar un archivo',
            life: 3000
        });
        return;
    }
    // Si es comprobante, mostrar confirmación
    if (props.tipoArchivo === 'comprobante') {
        mostrarConfirmacion.value = true;
        return;
    }
    // Si es factura, subir directamente
    emit('subir', {
        solicitudId: props.solicitud.id,
        archivo: archivoSeleccionado.value,
        tipo: props.tipoArchivo
    });
};

const confirmarSubida = () => {
    mostrarConfirmacion.value = false;
    emit('subir', {
        solicitudId: props.solicitud.id,
        archivo: archivoSeleccionado.value,
        tipo: props.tipoArchivo
    });
};

const cancelarConfirmacion = () => {
    mostrarConfirmacion.value = false;
};

const cancelar = () => {
    emit('update:visible', false);
    limpiarArchivo();
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :modal="true" :style="{ width: '500px' }" :header="getDialogTitle()" class="p-fluid">
        <div class="grid">
            <div class="col-12">
                <div class="text-center mb-4">
                    <i :class="getIconClass()" style="font-size: 3rem" class="text-primary"></i>
                    <h6 class="mt-2">{{ getDescription() }}</h6>
                    <p class="text-500 text-sm">{{ getFileRequirements() }}</p>
                </div>

                <FileUpload mode="basic" :choose-label="'Seleccionar archivo'" :accept="getAcceptedTypes()" :maxFileSize="5000000" @select="onFileSelect" @error="onFileError" :auto="false" class="w-full">
                    <template #empty>
                        <div class="text-center p-4">
                            <i class="pi pi-cloud-upload text-4xl text-400"></i>
                            <p class="text-500 mt-2">Arrastra y suelta el archivo aquí o haz clic para seleccionar</p>
                        </div>
                    </template>
                </FileUpload>

                <!-- Archivo seleccionado -->
                <div v-if="archivoSeleccionado" class="mt-3">
                    <div class="surface-100 border-round p-3">
                        <div class="flex align-items-center">
                            <i class="pi pi-file text-primary mr-2"></i>
                            <div class="flex-1">
                                <p class="m-0 font-medium">{{ archivoSeleccionado.name }}</p>
                                <p class="m-0 text-sm text-500">{{ formatFileSize(archivoSeleccionado.size) }}</p>
                            </div>
                            <Button icon="pi pi-times" class="p-button-text p-button-rounded p-button-danger" @click="limpiarArchivo" />
                        </div>
                    </div>
                </div>

                <!-- Instrucciones adicionales -->
                <div class="mt-3 p-3 surface-50 border-round">
                    <h6 class="text-primary mt-0">Instrucciones importantes:</h6>
                    <ul class="text-sm text-700 pl-3 mb-0">
                        <li v-if="tipoArchivo === 'comprobante'">Suba el comprobante de pago para verificar su transacción</li>
                        <li v-if="tipoArchivo === 'dress'">Suba imagen de su dress para poder realizar su transacción</li>
                        <li v-else>Solo administradores pueden subir facturas</li>
                        <li>El archivo debe ser claro y legible</li>
                        <li>Tamaño máximo: 5MB</li>
                        <li>Si ya existe un archivo, será reemplazado</li>
                    </ul>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelar" />
            <Button label="Subir archivo" icon="pi pi-upload" :loading="loading" :disabled="!archivoSeleccionado" @click="subirArchivo" />
        </template>

        <!-- Modal de confirmación para comprobante -->
        <Dialog v-model:visible="mostrarConfirmacion" header="¿Está seguro?" :modal="true" :style="{ width: '400px' }">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: orange" />
                <span>
                    ¿Está seguro de subir el comprobante?<br />
                    <b>Después de subir el comprobante no podrá editar ni eliminar la solicitud.</b>
                </span>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelarConfirmacion" />
                <Button label="Sí, subir comprobante" icon="pi pi-check" class="p-button-warning" @click="confirmarSubida" />
            </template>
        </Dialog>
    </Dialog>
</template>
