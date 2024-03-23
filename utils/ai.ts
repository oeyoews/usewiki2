import Groq from 'groq-sdk';
import { type ClientOptions } from 'groq-sdk';

/**
 * @see: https://github.com/groq/groq-typescript
 */
const ai = (question: string, options?: ClientOptions) => {
  // apiKey: options?.apiKey || process.env.GROQ_APIKEY,
  const apiKey = '';
  if (!apiKey) {
    ElMessage({
      message: '请先配置 GROQ_APIKEY',
      type: 'warning',
    });
    return;
  }
  const groq = new Groq({
    dangerouslyAllowBrowser: true,
    apiKey,
    maxRetries: 2, // default is 2
    timeout: 9 * 1000, //
  });

  const params = {
    messages: [
      {
        role: 'system',
        content:
          '我想让你充当中文翻译者，我会用任何语言与你交谈，你会检测语言，翻译成中文，保持相同的意思，我要你只回复更正、改进，不要写任何解释。不要删减文章，仅仅做 markdown 语法修正，适当加上 markdown 的标题段落',
      },
      {
        role: 'user',
        // TODO: hack prompt
        content: question,
      },
    ],
    model: 'mixtral-8x7b-32768',
  };

  const completions = groq.chat.completions;

  const res = completions.create(params).catch(async (err) => {
    if (err instanceof Groq.APIError) {
      console.error(err.status); // 400
      ElMessage({
        message: '[GROQ]: ' + err.status?.toString(),
        type: 'error',
      });
    } else {
      throw err;
    }
  });

  return res;
};

export default ai;
