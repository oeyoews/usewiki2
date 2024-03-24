import { ElMessage as notify } from 'element-plus';

export function copyMd(text: string) {
  navigator.clipboard.writeText(text);
  notify({
    message: '复制成功',
    type: 'success',
  });
}
