import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';

// @ts-ignore
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// See https://wxt.dev/api/config.html
export default defineConfig({
  imports: {
    addons: {
      vueTemplate: true,
    },
    presets: ['vue'],
  },
  vite: () => ({
    plugins: [
      vue(),
      Icons({
        autoInstall: true,
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }),
  manifest: {
    commands: {
      addtiddlywiki: {
        suggested_key: {
          default: 'Ctrl+Shift+F',
          mac: 'MacCtrl+Shift+F',
        },
        description: '执行我的命令',
      },
    },
    permissions: [
      'contextMenus',
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
