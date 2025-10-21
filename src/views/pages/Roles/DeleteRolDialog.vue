<script setup>
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

const emit = defineEmits(['update:visible', 'confirm']);

function hideDialog() {
    emit('update:visible', false);
}

function confirmDelete() {
    emit('confirm', props.role);
}
</script>

<template>
    <Dialog :visible="props.visible" :style="{ width: '450px' }" :modal="true" header="Confirmar eliminación" @update:visible="(value) => emit('update:visible', value)">
        <div class="flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl"></i>
            <span
                >¿Estás seguro de que quieres eliminar el rol <strong>{{ role?.nombre }}</strong
                >?</span
            >
        </div>
        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="hideDialog" />
            <Button label="Eliminar" severity="danger" @click="confirmDelete" />
        </template>
    </Dialog>
</template>
