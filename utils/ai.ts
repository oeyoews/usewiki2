import Groq from 'groq-sdk';
import { type ClientOptions } from 'groq-sdk';

/**
 * @see: https://github.com/groq/groq-typescript
 */
const ai = (question: string, options?: ClientOptions) => {
  const groq = new Groq({
    dangerouslyAllowBrowser: true,
    apiKey: options?.apiKey || process.env.GROQ_APIKEY,
    maxRetries: 2, // default is 2
    timeout: 9 * 1000, //
  });

  const params = {
    messages: [
      {
        role: 'system',
        content: '你是一个擅长写文章的 ai 助手',
      },
      {
        role: 'user',
        content: question + '\n 美化上面的 markdown 排版，翻译成中文',
      },
    ],
    model: 'mixtral-8x7b-32768',
  };

  const completions = groq.chat.completions;

  const res = completions.create(params).catch(async (err) => {
    if (err instanceof Groq.APIError) {
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
      ElMessage({
        message: err.status?.toString(),
        type: 'error',
      });
    } else {
      throw err;
    }
  });

  return res;
};

export default ai;
