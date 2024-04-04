import { ElMessage as notify } from 'element-plus';

export function copyMd(text: string) {
  if (!text) {
    notify({
      message: '内容为空',
      type: 'warning',
    });
    return;
  }
  navigator.clipboard.writeText(text);
  notify({
    message: '复制成功',
    type: 'success',
  });
}
