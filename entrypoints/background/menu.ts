export const menus: chrome.contextMenus.CreateProperties[] = [
  {
    id: 'usewiki2-save',
    title: '保存当前页面到 tiddlywiki',
    contexts: ['all'],
  },
  {
    id: 'usewiki2',
    title: '在侧边栏打开 Usewiki2',
    contexts: ['all'],
  },
  {
    id: 'usewiki2-bug',
    title: '提交 Bug',
    contexts: ['all'],
  },
];
