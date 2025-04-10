import { createApp } from 'vue';
import App from './App.vue';
import { MotionPlugin } from '@vueuse/motion';
import i18n from '@/src/i18n';

const app = createApp(App);
app.use(MotionPlugin).use(i18n);
app.mount('#app');
