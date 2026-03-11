// deprecated
import Groq from 'groq-sdk';
import { type ClientOptions } from 'groq-sdk';
import { type ChatCompletionCreateParams } from 'groq-sdk/resources/chat/completions';

import { ElMessage as notify } from 'element-plus';
import { t } from '@/src/i18n';

/**
 * @see: https://github.com/groq/groq-typescript
 */
const ai = async (question: string, options?: ClientOptions) => {
  let apiKey = (await storage.getItem('local:GROQ_APIKEY')) as string;

  if (!apiKey) {
    notify({
      message: t('notify.configureApiKey'),
      type: 'warning',
    });
    ElMessageBox.prompt(t('notify.enterApiKey'), t('notify.hint'), {
      confirmButtonText: t('notify.confirm'),
      cancelButtonText: t('notify.cancel'),
    }).then(({ value }) => {
      apiKey = value;
      browser.storage.sync.set({ GROQ_APIKEY: apiKey });
    });
    return;
  }

  if (apiKey) {
    notify({
      message: t('notify.startPolishing'),
      type: 'success',
    });
  }

  const groq = new Groq({
    dangerouslyAllowBrowser: true,
    apiKey,
    maxRetries: 2,
    timeout: 10 * 1000,
  });

  const params: ChatCompletionCreateParams = {
    messages: [
      {
        role: 'system',
        content:
          'I want you to act as a Chinese translator. I will speak to you in any language and you will detect the language, translate it into Chinese, keeping the same meaning. I want you to only reply with corrections and improvements, do not write any explanations. Do not delete content from the article, only make markdown syntax corrections and appropriately add markdown headings and paragraphs.',
      },
      // { role: 'assistant', content: '', },
      {
        role: 'user',
        content: question,
      },
    ],
    model:
      'mixtral-8x7b-32768' /** @see: https://console.groq.com/docs/models */,
    // seed: question.length,
    temperature: 0.5,
    stream: false,
  };

  const completions: Groq.Chat.Completions = groq.chat.completions;

  const res = completions.create(params).catch(async (err) => {
    if (err instanceof Groq.APIError) {
      notify({
        message: '[GROQ]: ' + err.message,
        type: 'error',
      });
    } else {
      throw err;
    }
  });

  if (!res) {
    notify({
      message: t('notify.polishFailed'),
      type: 'error',
    });
    return false;
  }

  return res;
};

export default ai;
