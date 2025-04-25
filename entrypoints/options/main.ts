import { createApp } from 'vue';
import App from './index.vue';
import i18n from '@/src/i18n';

const app = createApp(App);
app.use(i18n);
app.mount('#app');
