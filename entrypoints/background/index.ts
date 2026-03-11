import { menus, type MenuIds } from './menu';
// import save2TiddlyWiki from '../../utils/save2TiddlyWiki';
import constant from '../../utils/constant';
import open from './openTiddlyWikiWeb';
import save from './save';

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/cookbook.sidepanel-multiple/service-worker.js
// Background cannot access DOM directly, can only communicate with content script (main process) as a bridge
export default defineBackground({
  type: 'module', // !code ++
  main() {
    // browser.runtime.onStartup.addListener(() => { })
    const { pages } = constant;

    browser.runtime.onInstalled.addListener(function (details) {
      // Create context menus
      menus.map((menu) => {
        browser.contextMenus.create(menu as Browser.contextMenus.CreateProperties);
      });
      browser.runtime.setUninstallURL(
        'https://github.com/oeyoews/usewiki2/issues'
      );
      if (details.reason === 'install') {
        chrome.sidePanel
          .setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error(error));
        // @deprecated https://wxt.dev/guide/directory-structure/web-ext-config.html
        // chrome.sidePanel.setOptions({ path: pages.optionsPage });
        // Redirect to welcome page on first install
        // chrome.tabs.create({ url: pages.welcomePage, });
        // Click to directly open panel
        // if (!isDev) {
        //   browser.notifications.create({
        //     type: 'image',
        //     // eventTime: new Date().getTime(),
        //     title: constant.default_name,
        //     iconUrl: constant.tiddlywiki_icon,
        //     imageUrl: 'https://github.com/oeyoews/usewiki2/raw/main/banner03.png',
        //     // @ts-ignore
        //     buttons: [{ title: 'Close' }],
        //     silent: true,
        //     message: 'Welcome to ' + constant.default_name,
        //   });
        // }
      }
    });

    // browser.runtime.setUninstallURL('https://github.com/oeyoews/usewiki2/issues/new', () => {
    //   console.log('setUninstallURL');
    // });

    // https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api-samples/omnibox/simple-example/service-worker.js
    // https://developer.chrome.com/docs/extensions/reference/api/omnibox
    browser.omnibox.onInputStarted.addListener(function () {
      browser.omnibox.setDefaultSuggestion({
        description: 'Type <match>open</match> or press Enter to open TiddlyWiki',
      });
    });

    browser.omnibox.onInputChanged.addListener(function (text, suggest) {
      suggest([
        {
          content: 'doc',
          description: 'Type <match>doc</match> to view TiddlyWiki documentation',
        },
        // {
        //   content: 'save',
        //   description: 'Type <match>save</match> to save article',
        // },
      ]);
    });

    // Listen for omnibox input
    browser.omnibox.onInputEntered.addListener(function (text, suggest) {
      switch (text.trim()) {
        case 'o':
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
      }
    });

    // TODO: Extract to function, also add to onUpdated, change icon
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // Receive content script message
      if (request.type === 'tiddlywiki-send-message') {
        // https://stackoverflow.com/questions/14481107/typeerror-cannot-call-method-setbadgetext-of-undefined
        browser.action.setIcon({
          path: 'tw32.png',
        });
        return;

        // First-time prompt, then store so it won't show again
        browser.notifications.create({
          type: 'basic',
          iconUrl: 'tw256.png',
          title: 'Usewiki2',
          message: 'Congratulations, you discovered a TiddlyWiki website',
          // @ts-ignore
          silent: true,
          buttons: [{ title: 'Close' }],
          priority: 0,
        });

        // chrome.action.setBadgeText({ text: request.version });
      } else {
        browser.action.setIcon({
          path: 'icons/icon128.png',
        });
      }
    });

    setTimeout(() => {
      browser.tabs.onUpdated.addListener((tabId, info, tab) => {
        if (!tab.url || tab.url === 'null') {
          chrome.sidePanel.setOptions({
            tabId: 61,
            enabled: false,
          });
          return;
        }

        const url = new URL(tab.url);
        const domains = [
          'https://www.google.com',
          'https://www.bing.com',
          'https://www.baidu.com',
        ];

        const origin = tab.url;

        if (info.status === 'complete') {
          switch (true) {
            case origin.startsWith('https://') && !domains.includes(url.origin):
              // console.log('update');
              chrome.sidePanel.setOptions({
                // @deprecated HACK: Use a single ID to ensure only one side panel exists (may prevent other pages from using it)
                tabId: 61,
                enabled: true,
                path: pages.sidePanelPage,
              });
              chrome.tabs.sendMessage(tabId, {
                type: 'routeUpdate',
                // data: origin
              });
              break;

            default:
              // console.log('close');
              chrome.sidePanel.setOptions({
                tabId: 61,
                enabled: false,
              });
          }
        }

        // Notify side panel to update when page route changes
      });
    }, 1000);

    // browser.notifications.onButtonClicked.addListener((e) => {
    //   console.log(e, 'button');
    // });
    // browser.notifications.onClicked.addListener((e) => {
    //   console.log(e, 'clicked');
    // });

    const RULE: chrome.declarativeNetRequest.Rule = {
      id: 1,
      priority: 1,
      action: {
        // @ts-ignore
        type: 'modifyHeaders',
        responseHeaders: [
          // @ts-ignore
          { header: 'X-Frame-Options', operation: 'remove' },
          // @ts-ignore

          { header: 'Frame-Options', operation: 'remove' },
          // Uncomment the following line to suppress `frame-ancestors` error
          // {header: 'Content-Security-Policy', operation: 'remove'},
        ],
      },
      condition: {
        // initiatorDomains: [chrome.runtime.id],
        // requestDomains: iframeHosts,
        // resourceTypes: ['sub_frame'],
        urlFilter: '*',
        resourceTypes: [
          // @ts-ignore
          'main_frame',
          // @ts-ignore
          'sub_frame',
          // @ts-ignore
          'xmlhttprequest',
          // @ts-ignore
          'websocket',
        ],
      },
    };

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE.id],
      addRules: [RULE],
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
          // Right-click to open side panel
          chrome.sidePanel
            .open({
              // tabId: tab?.id!,
              tabId: 61,
              // windowId: tab?.windowId,
            })
            .catch((error) => console.error(error));
          break;
        default:
          break;
      }
    });
  },
});
