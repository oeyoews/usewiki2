import Groq from 'groq-sdk';
import { type ClientOptions } from 'groq-sdk';
import { type ChatCompletionCreateParams } from 'groq-sdk/resources/chat/completions';

import { ElMessage as notify } from 'element-plus';

/**
 * @see: https://github.com/groq/groq-typescript
 */
const ai = async (question: string, options?: ClientOptions) => {
  let apiKey = (await storage.getItem('local:GROQ_APIKEY')) as string;

  if (!apiKey) {
    notify({
      message: '请先配置 GROQ_APIKEY',
      type: 'warning',
    });
    ElMessageBox.prompt('请输入你的 GROQ APIKEY', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    }).then(({ value }) => {
      apiKey = value;
      chrome.storage.local.set({ GROQ_APIKEY: apiKey });
    });
    return;
  }

  if (apiKey) {
    notify({
      message: '开始润色',
      type: 'success',
    });
  }

  const groq = new Groq({
    dangerouslyAllowBrowser: true,
    apiKey,
    maxRetries: 2, // default is 2
    timeout: 9 * 1000, //
  });

  // TODO: 上下文压缩
  // Groq.Chat.CompletionCreateParams
  const params: ChatCompletionCreateParams = {
    messages: [
      {
        role: 'system',
        content:
          '我想让你充当中文翻译者，我会用任何语言与你交谈，你会检测语言，翻译成中文，保持相同的意思，我要你只回复更正、改进，不要写任何解释。不要删减文章，仅仅做 markdown 语法修正，适当加上 markdown 的标题段落',
      },
      // {
      //   role: 'assistant',
      //   content: '',
      // },
      {
        role: 'user',
        // TODO: hack prompt
        content: question,
      },
    ],
    // TODO: 支持选择模型
    // @see: https://console.groq.com/docs/models
    model: 'mixtral-8x7b-32768',
    // model: 'gemma-7b-it',
    // model: 'llama2-70b-4096',
    // seed: question.length,
    temperature: 0.5,
    stream: false,
  };

  const completions: Groq.Chat.Completions = groq.chat.completions;

  const res = completions.create(params).catch(async (err) => {
    if (err instanceof Groq.APIError) {
      console.error(err.status); // 400
      notify({
        message: '[GROQ]: ' + err.status?.toString(),
        type: 'error',
      });
    } else {
      throw err;
    }
  });

  if (!res) {
    notify({
      message: '润色失败',
      type: 'error',
    });
    return;
  }

  return res;
};

export default ai;
