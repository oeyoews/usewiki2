export const menus = [
  {
    id: 'usewiki2-open',
    title: '直接打开 TiddlyWiki',
    contexts: ['all'],
  },
  {
    id: 'usewiki2-save',
    title: '保存当前页面到 TiddlyWiki',
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
] as const;

export type MenuIds = (typeof menus)[number]['id'];
