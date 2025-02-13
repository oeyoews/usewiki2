import constant from './constant';

export const portStorage = storage.defineItem<number>('sync:port', {
  defaultValue: constant.default_port,
});

export const aiStorage = storage.defineItem<{
  baseurl: string;
  apiKey: string;
}>('sync:ai', {
  defaultValue: {
    baseurl: '',
    apiKey: '',
  },
});

export const authStorage = storage.defineItem<{
  username: string;
  password: string;
}>('sync:auth', {
  defaultValue: {
    username: '',
    password: '',
  },
});

export const tagStorage = storage.defineItem<string[]>('sync:tags', {
  defaultValue: [constant.default_tag],
});

export const isCheckTw5Storage = storage.defineItem<boolean>(
  'sync:isCheckTw5',
  {
    defaultValue: false,
  }
);

// const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

export const isDarkModeStorage = storage.defineItem<boolean>(
  'sync:isDarkMode',
  {
    defaultValue: false,
  }
);
