import { createI18n } from 'vue-i18n';
import en from './locales/en';
import zh from './locales/zh';

export type MessageSchema = typeof en;

const messages = {
  en,
  zh,
};

export type ILocales = 'en' | 'zh';

function getDefaultLocale(): ILocales {
  const saved = localStorage.getItem('locale');
  if (saved === 'en' || saved === 'zh') return saved;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

const i18n = createI18n<[MessageSchema], ILocales>({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh',
  globalInjection: true,
  messages,
});

export default i18n;

/** Use this to access translations outside Vue components */
export function t(key: string, params?: Record<string, unknown>) {
  // @ts-ignore - accessing global composer
  return i18n.global.t(key, params ?? {});
}
