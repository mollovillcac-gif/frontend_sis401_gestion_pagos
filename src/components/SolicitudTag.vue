<script setup>
defineProps({
    value: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        validator: (value) => ['estado', 'tipo'].includes(value)
    }
});

const getClass = (value, type) => {
    if (type === 'estado') {
        const classes = {
            pendiente: 'p-tag-warning',
            subido: 'p-tag-info',
            verificada: 'p-tag-success',
            pagada: 'p-tag-success',
            anulada: 'p-tag-danger'
        };
        return classes[value] || '';
    } else if (type === 'tipo') {
        const classes = {
            gatein: 'p-tag-success',
            demora: 'p-tag-warning',
            liberacion: 'p-tag-info',
            giros: 'p-tag-help'
        };
        return classes[value] || '';
    }
    return '';
};
</script>

<template>
    <Tag :value="value" :class="getClass(value, type)" />
</template>
