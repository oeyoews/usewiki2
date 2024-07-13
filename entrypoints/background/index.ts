import { menus, type MenuIds } from './menu';
import { type Menus } from 'wxt/browser';
// import save2TiddlyWiki from '../../utils/save2TiddlyWiki';
import constant from '../../utils/constant';
import open from './open';
import save from './save';

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/cookbook.sidepanel-multiple/service-worker.js
// background 不能直接访问dom, 只能和content 通信, content(主进程) 类似一个桥梁
export default defineBackground(() => {
  // browser.runtime.onStartup.addListener(() => { })
  const { pages } = constant;

  // browser.tabs.onActivated
  browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
      // chrome.sidePanel.setOptions({ path: pages.optionsPage });
      // 首次安装调转到欢迎页面
      // chrome.tabs.create({ url: pages.welcomePage, });
      // 单击直接打开 panel
      chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error(error));

      browser.notifications.create({
        type: 'image',
        // eventTime: new Date().getTime(),
        title: constant.default_name,
        iconUrl: constant.tiddlywiki_icon,
        imageUrl: 'https://github.com/oeyoews/usewiki2/raw/main/banner03.png',
        // @ts-ignore
        buttons: [{ title: '关闭' }],
        silent: true,
        message: '欢迎使用' + constant.default_name,
      });
    }
  });

  // browser.runtime.setUninstallURL('https://github.com/oeyoews/usewiki2/issues/new', () => {
  //   console.log('setUninstallURL');
  // });

  // https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/omnibox/simple-example/service-worker.js
  // https://developer.chrome.com/docs/extensions/reference/api/omnibox
  browser.omnibox.onInputStarted.addListener(function () {
    browser.omnibox.setDefaultSuggestion({
      description: '输入<match>open</match>或者回车打开 TiddlyWiki',
    });
  });

  browser.omnibox.onInputChanged.addListener(function (text, suggest) {
    suggest([
      {
        content: 'doc',
        description: '输入<match>doc</match>查看 TiddlyWiki 中文文档',
      },
      // {
      //   content: 'save',
      //   description: '输入<match>save</match>保存文章',
      // },
    ]);
  });

  browser.omnibox.onInputEntered.addListener(function (text, suggest) {
    switch (text.trim()) {
      case 'open':
        open();
        break;
      case 'save':
        save();
        break;
      case 'doc':
        browser.tabs.create({
          url: 'https://bramchen.github.io/tw5-docs/zh-Hans',
        });
        break;
      default:
        open();
    }
  });

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 接收content 消息
    if (request.type === 'tiddlywiki-send-message') {
      // https://stackoverflow.com/questions/14481107/typeerror-cannot-call-method-setbadgetext-of-undefined
      browser.action.setIcon({
        path: 'tw32.png',
      });

      // 首次打开提示，然后存储，不再提示
      browser.notifications.create({
        type: 'basic',
        iconUrl: 'tw256.png',
        title: 'Usewiki2',
        message: '恭喜你，发现了一个 TiddlyWiki 网站',
        // @ts-ignore
        silent: true,
        buttons: [{ title: '关闭' }],
        priority: 0,
      });

      // chrome.action.setBadgeText({ text: request.version });
    } else {
      browser.action.setIcon({
        path: 'icons/icon128.png',
      });
    }
  });

  // https://wxt.dev/guide/directory-structure/entrypoints/sidepanel.html

  // browser.tabs.onActivated.addListener(async ({ tabId }) => {
  //   const { path } = await chrome.sidePanel.getOptions({ tabId });
  //   if (path === pages.optionsPage) {
  //     chrome.sidePanel.setOptions({ path: pages.sidePanelPage });
  //   }
  // });

  // 页面路由发生变化通知侧边栏前端页面更新
  browser.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete') {
      chrome.tabs.sendMessage(tabId, {
        type: 'routeUpdate',
      });
    }
  });

  browser.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    const domains = [
      'https://www.google.com',
      'https://www.bing.com',
      'https://baidu.com',
    ];
    // || url.origin.startsWith('chrome://')
    if (!domains.includes(url.origin)) {
      chrome.sidePanel.setOptions({
        tabId,
        path: pages.sidePanelPage,
        enabled: true,
      });
    } else {
      chrome.sidePanel.setOptions({
        tabId,
        enabled: false,
      });
    }
  });

  // 右键菜单
  browser.runtime.onInstalled.addListener(() => {
    menus.map((menu) => {
      browser.contextMenus.create(menu as Menus.CreateCreatePropertiesType);
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId } = info;
    switch (menuItemId as MenuIds) {
      case 'usewiki2-open':
        open();
        break;
      case 'usewiki2-save':
        save(tab?.id!);
        break;
      case 'usewiki2-bug':
        browser.tabs.create({
          url: 'https://github.com/oeyoews/usewiki2/issues/new',
        });
        break;
      case 'usewiki2':
        // @see: https://developer.chrome.com/docs/extensions/reference/api/sidePanel?hl=zh-cn
        // 右键打开侧边栏
        chrome.sidePanel
          .open({
            tabId: tab?.id!,
            // windowId: tab?.windowId,
          })
          .catch((error) => console.error(error));
        break;
      default:
        break;
    }
  });
});
