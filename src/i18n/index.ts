import { createI18n } from 'vue-i18n';
import en from './locales/en';
import zh from './locales/zh';

export type MessageSchema = typeof en;

export default createI18n<[MessageSchema], 'en' | 'zh'>({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh',
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
});

// type MessageSchema = typeof en;
// export const i18n = useI18n<[MessageSchema], 'en' | 'zh'>({
//   locale: localStorage.getItem('locale') || 'zh',
//   fallbackLocale: 'en',
//   messages: {
//     en,
//     zh,
//   },
// });

// import messages from '@intlify/unplugin-vue-i18n/messages';

// export default createI18n({
//   locale: 'en',
//   messages,
// });
