<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({
    isActive: {
        type: Boolean,
        required: true
    }
});
</script>

<template>
    <Tag :value="isActive ? 'SI' : 'NO'" :severity="isActive ? 'success' : 'danger'" rounded />
</template>
