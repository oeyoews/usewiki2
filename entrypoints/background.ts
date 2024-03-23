export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason !== 'install') return;

    await browser.tabs.create({
      url: browser.runtime.getURL('/welcome.html'),
      active: true,
    });
  });

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
