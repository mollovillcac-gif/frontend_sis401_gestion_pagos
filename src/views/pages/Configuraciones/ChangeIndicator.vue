<script setup>
defineProps({
    hasChanges: {
        type: Boolean,
        default: false
    },
    saving: {
        type: Boolean,
        default: false
    }
});

defineEmits(['save']);
</script>

<template>
    <div v-if="hasChanges" class="fixed top-0 right-0 m-4 z-5">
        <Card class="border-left-4 border-orange-500 shadow-4">
            <template #content>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-exclamation-triangle text-orange-500"></i>
                    <span class="font-medium text-900">Tienes cambios sin guardar</span>
                    <Button icon="pi pi-save" size="small" @click="$emit('save')" :loading="saving" class="ml-2" />
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.z-5 {
    z-index: 1000;
}
</style>
