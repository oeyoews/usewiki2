export function randomChar() {
  return Math.random().toString(36).slice(-8);
}

export function resetGROQAPIKEY() {
  chrome.storage.local.remove('GROQ_APIKEY');
  ElMessage({
    type: 'success',
    message: '已成功重置 GROQ API KEY',
  });
}

export function saveGROQAPIKEY(GROQ_APIKEY: string) {
  if (!GROQ_APIKEY) {
    ElMessage({
      type: 'error',
      message: '请输入 GROQ API KEY',
    });
    return;
  }
  chrome.storage.local.set({ GROQ_APIKEY });
  ElMessage({
    type: 'success',
    message: '保存成功',
  });
}
