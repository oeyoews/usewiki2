export function copyMd(text: string) {
  navigator.clipboard.writeText(text);
  ElMessage({
    message: '复制成功',
    type: 'success',
  });
}
