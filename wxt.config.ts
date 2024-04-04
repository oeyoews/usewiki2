import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import path from 'path';

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
    resolve: {
      alias: {
        '@/': `${path.resolve(__dirname)}/`,
      },
    },
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
    web_accessible_resources: [
      {
        resources: ['injected.js'],
        matches: ['<all_urls>'],
      },
    ],
    // commands: {
    //   addtiddlywiki: {
    //     suggested_key: {
    //       default: 'Ctrl+Shift+F',
    //       mac: 'MacCtrl+Shift+F',
    //     },
    //     description: '执行我的命令',
    //   },
    // },
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
    name: 'Usewiki2',
    description: 'Usewiki2: usewiki 的 vue 版本',
    permissions: [
      'sidePanel',
      'contextMenus',
      'notifications',
      'alarms',
      'activeTab',
      'contextMenus',
      'storage',
      '<all_urls>',
      'tabs',
      'scripting',
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    host_permissions: ['<all_urls>'],
    // optional_permissions: ['https://google.com/**', 'https://bing.com/'],
    // https://developer.chrome.com/docs/extensions/reference/api/sidePanel
    // sidebar_action: {
    //   default_panel: 'sidepanel.html',
    // default_icon: 'icons/icon48.png',
    // },

    action: {
      default_title: '单击打开 Usewiki2',
    },
    browser_action: {
      // default_popup: 'popup.html',
      default_title: 'Usewiki2',
    },
  },
});
