import { createI18n } from 'vue-i18n';
import en from './locales/en';
import zh from './locales/zh';

export type MessageSchema = typeof en;

const messages = {
  en,
  zh,
};

export type ILocales = 'en' | 'zh';

export default createI18n<[MessageSchema], ILocales>({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh',
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
});
