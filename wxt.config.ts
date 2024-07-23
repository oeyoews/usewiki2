import { defineConfig } from 'wxt';
// import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import path from 'path';

// @ts-ignore
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
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
    plugins: [
      // vue(),
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
    description: 'TiddlyWiki5 的浏览器扩展',
    omnibox: { keyword: 'tw' },
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
    // NOTE: 这会影响网络请求，比如获取 status, 开发环境下无影响
    host_permissions: ['<all_urls>'],
    // host_permissions: ['https://*/*', 'http://*/*'],
    // optional_permissions: ['https://google.com/**', 'https://bing.com/'],
    // https://developer.chrome.com/docs/extensions/reference/api/sidePanel
    // sidebar_action: {
    //   default_panel: 'sidepanel.html',
    // default_icon: 'icons/icon48.png',
    // },

    action: {
      default_title: 'TiddlyWiki5 的浏览器扩展',
    },
    browser_action: {
      // default_popup: 'popup.html',
      default_title: 'Usewiki2',
    },
  },
});
