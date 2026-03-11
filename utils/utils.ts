export function randomChar() {
  return Math.random().toString(36).slice(-8);
}
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { t } from '@/src/i18n';

export function resetGROQAPIKEY() {
  browser.storage.local.remove('GROQ_APIKEY');
  notify({
    type: 'success',
    message: t('notify.resetApiKeySuccess'),
  });
}

export const isDev = process.env.NODE_ENV === 'development';

export function saveGROQAPIKEY(GROQ_APIKEY: string) {
  if (!GROQ_APIKEY) {
    notify({
      type: 'error',
      message: t('notify.enterApiKeyPrompt'),
    });
    return;
  }
  browser.storage.sync.set({ GROQ_APIKEY });
  notify({
    type: 'success',
    message: t('notify.saveSuccess'),
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
