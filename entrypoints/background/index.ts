import { menus, type MenuIds } from './menu';
import save2TiddlyWiki from '../../utils/save2TiddlyWiki';
import * as constant from '../../utils/constant';

export default defineBackground(() => {
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
      path: 'popup.html',
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
      case 'usewiki2-save':
        // TODO: 需要检查连接状态
        chrome.tabs.sendMessage(
          // @ts-ignore
          tab.id,
          {
            info: 'get-doc',
            message: '获取文章',
          },
          async function (response: IArticle) {
            console.log(response);
            chrome.notifications.create({
              type: 'basic',
              title: constant.default_name,
              message: '敬请期待',
              iconUrl: constant.tiddlywiki_icon,
            });
          }
        );

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
