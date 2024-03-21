import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';

// See https://wxt.dev/api/config.html
export default defineConfig({
  imports: {
    addons: {
      vueTemplate: true,
    },
  },
  vite: () => ({
    plugins: [vue()],
  }),
  manifest: {
    permissions: [
      'alarms',
      'activeTab',
      'contextMenus',
      'storage',
      '<all_urls>',
      'tabs',
      'scripting',
    ],
    host_permissions: ['<all_urls>'],
    browser_action: {
      default_popup: 'popup.html',
    },
  },
});
