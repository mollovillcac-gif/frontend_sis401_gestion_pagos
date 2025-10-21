<script setup>
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

const emit = defineEmits(['update:visible', 'confirm']);

function hideDialog() {
    emit('update:visible', false);
}

function confirmToggle() {
    emit('confirm', props.naviera);
}
</script>

<template>
    <Dialog :visible="props.visible" :style="{ width: '450px' }" :modal="true" :header="props.naviera?.activo ? 'Confirmar inactivación' : 'Confirmar activación'" @update:visible="(value) => emit('update:visible', value)">
        <div class="flex items-center gap-3">
            <i :class="props.naviera?.activo ? 'pi pi-ban text-yellow-500 text-4xl' : 'pi pi-check text-green-500 text-4xl'"></i>
            <span>
                ¿Estás seguro de que quieres {{ props.naviera?.activo ? 'inactivar' : 'activar' }} la naviera <strong>{{ naviera?.nombre }}</strong
                >?
            </span>
        </div>
        <template #footer>
            <Button label="Cancelar" class="p-button-text" @click="hideDialog" />
            <Button :label="props.naviera?.activo ? 'Inactivar' : 'Activar'" :severity="props.naviera?.activo ? 'warning' : 'success'" @click="confirmToggle" />
        </template>
    </Dialog>
</template>
