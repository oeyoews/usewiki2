import { defineConfig } from 'wxt';
// import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import path from 'path';
// import vueDevTools from 'vite-plugin-vue-devtools';

// @ts-ignore
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  webExt: {
    openDevtools: true,
    openConsole: true,
    startUrls: ['https://blog.oeyoews.top'],
  },
  // srcDir: 'src',
  // publicDir: 'src/public',
  // modulesDir: 'src/modules',
  // https://github.com/wxt-dev/wxt/pull/716/files
  vue: {
    vite: {
      script: {
        // propsDestructure: true,
        // defineModel: true,
      },
    },
  },
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
    build: {
      rollupOptions: {
        output: {
          // manualChunks:
        },
      },
    },
    plugins: [
      // vue(),
      // vueDevTools({
      //   appendTo: '/entrypoints/sidepanel/main.ts',
      // }),
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
    // web_accessible_resources: [
    //   {
    //     resources: ['injected.js'],
    //     matches: ['<all_urls>'],
    //   },
    // ],
    // commands: {
    //   addtiddlywiki: {
    //     suggested_key: {
    //       default: 'Ctrl+Shift+F',
    //       mac: 'MacCtrl+Shift+F',
    //     },
    //     description: 'Execute my command',
    //   },
    // },
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
    default_locale: 'zh',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    omnibox: { keyword: '@tw' },
    permissions: [
      'sidePanel',
      'contextMenus',
      'notifications',
      'alarms',
      'activeTab',
      'contextMenus',
      'storage',
      // '<all_urls>',
      'tabs',
      'scripting',
      'declarativeNetRequestWithHostAccess',
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    // NOTE: This affects network requests, e.g. fetching status; no impact in dev environment
    host_permissions: ['<all_urls>'],
    // host_permissions: ['https://*/*', 'http://*/*'],
    // optional_permissions: ['https://google.com/**', 'https://bing.com/'],
    // https://developer.chrome.com/docs/extensions/reference/api/sidePanel
    // sidebar_action: {
    //   default_panel: 'sidepanel.html',
    // default_icon: 'icons/icon48.png',
    // },

    action: {
      default_title: '__MSG_extActionTitle__',
    },
    browser_action: {
      // default_popup: 'popup.html',
      default_title: 'Usewiki2',
    },
  },
});
