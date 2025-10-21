<script setup>
import { onMounted, computed } from 'vue';
import { useLayout } from './layout/composables/layout';
import ChatWidget from '@/components/chat/ChatWidget.vue';

const { initTheme } = useLayout();
onMounted(() => initTheme());

// Ejemplo: rol y nombre desde localStorage (ajústalo a tu auth real)
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
// { rol: 'admin' | 'user', name: 'Mery' }
const role = computed(() => userData.rol || 'user');
const name = computed(() => userData.name || (role.value === 'admin' ? 'Admin' : 'Cliente'));
</script>

<template>
  <router-view />

  <ChatWidget
    v-if="role"
    :role="role"
    room="soporte"
    :userName="role === 'user' ? name : 'Cliente'"
    :adminName="role === 'admin' ? name : 'Administrador'"
  />
</template>

<style>
@import '@/assets/style.css';
</style>
