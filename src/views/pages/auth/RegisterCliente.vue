<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { UsuariosService } from '@/service/UsuariosService';
import { RolesService } from '@/service/RolesService';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/index';

const usuario = ref('');
const nombre = ref('');
const apellido = ref('');
const clave = ref('');
const isLoading = ref(false);
const authStore = useAuthStore();
const error = ref('');
const success = ref('');
const toast = useToast();
const roles = ref([]);
const router = useRouter();

const filters = ref({
    page: 1,
    limit: 20,
    sord: 'DESC',
    sidx: 'id',
    nombre: 'cliente',
    activo: true
});

async function getRoles() {
    isLoading.value = true;
    try {
        const response = await RolesService.getAll({ ...filters.value });
        roles.value = response.data.data;
        console.log('Roles obtenidos:', roles.value);
    } catch (e) {
        error.value = e;
    } finally {
        isLoading.value = false;
    }
}

getRoles();

async function onSubmit() {
    error.value = '';
    success.value = '';
    if (!usuario.value || !nombre.value || !apellido.value || !clave.value) {
        error.value = 'Completa todos los campos.';
        return;
    }
    if (!roles.value[0]?.id) {
        error.value = 'No se pudo asignar el rol cliente.';
        return;
    }
    isLoading.value = true;
    try {
        await UsuariosService.create({
            usuario: usuario.value,
            nombre: nombre.value,
            apellido: apellido.value,
            clave: clave.value,
            activo: false,
            usuarioId: authStore.usuarioid,
            rolId: roles.value[0]?.id
        });
        success.value = 'Usuario cliente creado exitosamente. Espere aprobación del administrador para activar su cuenta.';
        toast.add({ severity: 'success', summary: 'Éxito', detail: success.value, life: 5000 });
        usuario.value = '';
        nombre.value = '';
        apellido.value = '';
        clave.value = '';
        setTimeout(() => {
            router.push('/auth/login');
        }, 3000);
    } catch (e) {
        error.value = e?.response?.data?.message || 'Error al crear usuario cliente.';
        toast.add({ severity: 'error', summary: 'Error', detail: error.value, life: 5000 });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center w-full">
            <div class="w-full max-w-[600px] bg-surface-0 dark:bg-surface-900 p-12 rounded-2xl shadow-xl">
                <div class="text-center mb-10">
                    <h1 class="text-surface-900 dark:text-surface-0 text-4xl font-bold mb-3">Registro Cliente</h1>
                    <p class="text-muted-color text-xl">Crea tu cuenta para operar</p>
                </div>
                <form @submit.prevent="onSubmit" class="w-full">
                    <div class="mb-8">
                        <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4">Usuario:</label>
                        <InputText type="text" placeholder="Usuario" class="w-full p-4 text-xl" v-model="usuario" />
                    </div>
                    <div class="mb-8">
                        <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4">Nombre:</label>
                        <InputText type="text" placeholder="Nombre" class="w-full p-4 text-xl" v-model="nombre" />
                    </div>
                    <div class="mb-8">
                        <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4">Apellido:</label>
                        <InputText type="text" placeholder="Apellido" class="w-full p-4 text-xl" v-model="apellido" />
                    </div>
                    <div class="mb-8">
                        <label class="block text-surface-900 dark:text-surface-0 font-semibold text-lg mb-4">Contraseña:</label>
                        <Password
                            v-model="clave"
                            placeholder="Contraseña"
                            :toggleMask="true"
                            :feedback="true"
                            fluid
                            promptLabel="Ingresa una contraseña"
                            weakLabel="Débil"
                            mediumLabel="Media"
                            strongLabel="Fuerte"
                            inputClass="w-full p-4 text-xl"
                            class="w-full"
                        />
                    </div>
                    <Message v-if="error" severity="error" class="mb-6">{{ error }}</Message>
                    <Message v-if="success" severity="success" class="mb-6">{{ success }}</Message>
                    <Button type="submit" :disabled="isLoading" class="w-full bg-primary hover:bg-primary-dark text-white dark:text-surface-0 font-bold py-5 px-8 rounded-xl text-xl mb-6">
                        {{ isLoading ? 'Cargando...' : 'Registrarse' }}
                    </Button>
                    <div class="text-center mb-6">
                        <router-link to="/auth/login" class="text-primary hover:underline"> Ir al Login </router-link>
                    </div>
                    <div class="text-center mb-6">
                        <router-link to="/" class="text-primary hover:underline"> Volver al inicio </router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
