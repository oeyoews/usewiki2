export const portStorage = storage.defineItem<number>('sync:port', {
  defaultValue: 8080,
});

export const tagStorage = storage.defineItem<string[]>('sync:tags', {
  defaultValue: ['剪藏'],
});

export const isCheckTw5Storage = storage.defineItem<boolean>(
  'sync:isCheckTw5',
  {
    defaultValue: false,
  }
);
