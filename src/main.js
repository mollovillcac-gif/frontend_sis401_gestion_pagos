import Aura from '@primevue/themes/aura';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { createApp } from 'vue';
import App from './App.vue';
import { useLayout } from './layout/composables/layout';
import router from './router';


import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);
const { initTheme } = useLayout();
app.directive('tooltip', Tooltip);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
    ripple: true,
    unstyled: false,
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
initTheme();
