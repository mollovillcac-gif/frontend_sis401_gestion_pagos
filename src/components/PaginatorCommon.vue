<script setup>
defineProps({
    filters: {
        type: Object,
        required: true
    },
    datatable: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['eToPage', 'eRefresh']);

function toPage(event) {
    emit('eToPage', Math.floor(event.first / event.rows) + 1);
}

function search() {
    emit('eRefresh');
}
</script>

<template>
    <section class="mt-4">
        <div class="flex items-center justify-between">
            <Paginator :rows="filters.limit" :totalRecords="datatable.total" :first="(filters.page - 1) * filters.limit" @page="toPage" template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" size="small" class="mt-4" />

            <i class="pi pi-refresh text-lg cursor-pointer transition hover:text-primary mt-4" @click="search"></i>
        </div>

        <div class="flex justify-center mt-2">
            <small>Total: {{ datatable.total }} registros.</small>
        </div>
    </section>
</template>
