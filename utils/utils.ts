export function randomChar() {
  return Math.random().toString(36).slice(-8);
}

export function resetGROQAPIKEY() {
  browser.storage.local.remove('GROQ_APIKEY');
  notify({
    type: 'success',
    message: '已成功重置 GROQ API KEY',
  });
}

export const isDev = process.env.NODE_ENV === 'development';

export function saveGROQAPIKEY(GROQ_APIKEY: string) {
  if (!GROQ_APIKEY) {
    notify({
      type: 'error',
      message: '请输入 GROQ API KEY',
    });
    return;
  }
  browser.storage.sync.set({ GROQ_APIKEY });
  notify({
    type: 'success',
    message: '保存成功',
  });
}
