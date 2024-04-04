import { menus, type MenuIds } from './menu';
// import save2TiddlyWiki from '../../utils/save2TiddlyWiki';
import * as constant from '../../utils/constant';
import open from './open';
import save from './save';

export default defineBackground(() => {
  // https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/omnibox/simple-example/service-worker.js
  // https://developer.chrome.com/docs/extensions/reference/api/omnibox
  chrome.omnibox.onInputStarted.addListener(function () {
    chrome.omnibox.setDefaultSuggestion({
      description: '输入<match>open</match>或者回车打开 TiddlyWiki',
    });
  });

  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
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

  chrome.omnibox.onInputEntered.addListener(function (text, suggest) {
    switch (text.trim()) {
      case 'open':
        open();
        break;
      case 'save':
        save();
        break;
      case 'doc':
        chrome.tabs.create({
          url: 'https://bramchen.github.io/tw5-docs/zh-Hans',
        });
        break;
      default:
        open();
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.info === 'tiddlywiki-send-message') {
      console.log(request);
      // https://stackoverflow.com/questions/14481107/typeerror-cannot-call-method-setbadgetext-of-undefined
      chrome.action.setIcon({
        path: 'tw32.png',
      });

      // 首次打开提示，然后存储，不再提示
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'tw256.png',
        title: 'Usewiki2',
        message: '恭喜你，发现了一个 TiddlyWiki 网站',
        // buttons: [{ title: 'Keep it Flowing.' }],
        priority: 0,
      });

      // chrome.action.setBadgeText({ text: request.version });
    } else {
      chrome.action.setIcon({
        path: 'icons/icon128.png',
      });
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    });
  });

  // 单击直接打开 panel
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  // 右键菜单
  chrome.runtime.onInstalled.addListener(() => {
    menus.map((menu) => {
      chrome.contextMenus.create(
        menu as unknown as chrome.contextMenus.CreateProperties
      );
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
        chrome.tabs.create({
          url: 'https://github.com/oeyoews/usewiki2/issues/new',
        });
        break;
      case 'usewiki2':
        chrome.sidePanel
          .open({ tabId: tab?.id! })
          .catch((error) => console.error(error));
        break;
      default:
        break;
    }
  });
});
