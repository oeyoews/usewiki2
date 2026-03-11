export const menus = [
  {
    id: 'usewiki2-open',
    title: chrome.i18n.getMessage('menuOpenTiddlyWiki'),
    contexts: ['page'],
  },
  {
    id: 'usewiki2-save',
    title: chrome.i18n.getMessage('menuSavePage'),
    contexts: ['page'],
  },
  {
    id: 'usewiki2',
    title: chrome.i18n.getMessage('menuOpenSidebar'),
    contexts: ['page'],
  },
  {
    id: 'usewiki2-separator',
    type: 'separator',
  },
  {
    id: 'usewiki2-bug',
    title: chrome.i18n.getMessage('menuReportBug'),
    contexts: ['page'],
  },
] as const;

export type MenuIds = (typeof menus)[number]['id'];
