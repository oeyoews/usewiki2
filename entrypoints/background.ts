export default defineBackground(() => {
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
    chrome.contextMenus.create({
      id: 'usewiki2',
      title: '打开 Usewiki2',
      contexts: ['all'],
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'usewiki2') {
      chrome.sidePanel
        .open({ tabId: tab?.id! })
        .catch((error) => console.error(error));
    }
  });

  // browser.runtime.onInstalled.addListener(async ({ reason }) => {
  //   if (reason !== 'install') return;
  //   await browser.tabs.create({
  //     url: browser.runtime.getURL('/welcome.html'),
  //     active: true,
  //   });
  // });
  // browser.browserAction.setTitle({ title: 'Usewiki2' });
  // browser.browserAction.setBadgeText({ text: 'Usewiki2' });
  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   chrome.action.setBadgeText({ text: 'on' });
  // });
  /*   chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
      id: 'tiddlywiki',
      title: '添加到 TiddlyWiki(WIP)',
      contexts: ['all'],
    });
  });

  chrome.commands.onCommand.addListener(function (command) {
    if (command === 'addtiddlywiki') {
      // 处理快捷键被触发时的逻辑
    }
  });

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'tiddlywiki') {
      // 处理右键菜单点击事件的逻辑
    }
  }); */
});
