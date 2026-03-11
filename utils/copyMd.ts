import { ElMessage as notify } from 'element-plus';
import { t } from '@/src/i18n';

export function copyMd(text: string) {
  if (!text) {
    notify({
      message: t('notify.contentEmpty'),
      type: 'warning',
    });
    return;
  }
  navigator.clipboard.writeText(text);
  notify({
    message: t('notify.copySuccess'),
    type: 'success',
  });
}
