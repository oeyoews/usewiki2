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
});
