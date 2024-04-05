import * as constant from './constant';

export const portStorage = storage.defineItem<number>('sync:port', {
  defaultValue: constant.default_port,
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
