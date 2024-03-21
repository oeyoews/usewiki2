import { createApp } from 'vue';
import './style.css';
// @ts-expect-error
import App from './App.vue';

createApp(App).mount('#app');
