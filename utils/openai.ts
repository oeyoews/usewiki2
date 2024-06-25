import OpenAI from 'openai';

// TODO: 总结一下这篇文章
/** @see: https://docs.siliconflow.cn/reference/chat-completions-1 */
async function getAI(content = 'who you are') {
  const openai = new OpenAI({
    apiKey: 'sk-xxxxxx',
    baseURL: 'https://api.siliconflow.cn/v1',
    dangerouslyAllowBrowser: true,
  });

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [{ role: 'user', content }],
    model: 'Qwen/Qwen2-72B-Instruct',
    stream: true,
  };
  const stream = await openai.chat.completions.create(params);
  for await (const chunk of stream) {
    // process.stdout.write(chunk.choices[0]?.delta?.content || '');
    console.log(chunk.choices[0]?.delta?.content || '');
  }
}

export default getAI;
