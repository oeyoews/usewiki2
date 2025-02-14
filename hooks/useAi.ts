import { ElMessage as notify } from 'element-plus';

// 403 NOTE: https://github.com/ollama/ollama/issues/4115

/**
 * chatgpt
 * @param {Object} data - data
 * @param {string} data.baseurl - baseurl
 * @param {string} data.content - content
 * @param {string} data.model - model
 * @param {string} data.apiKey - model
 */
export async function useAi(data: any) {
  if (!navigator.onLine) {
    notify.error('无网络连接');
    return;
  }
  const baseurl = data.baseurl || 'https://api.openai.com';
  const url = `${baseurl}/v1/chat/completions`;

  // v1/models 查询models 并保存(startup)

  const models = {
    gpt4: 'gpt-4',
    gpt35: 'gpt-3.5-turbo',
    gpt4omini: 'gpt-4o-mini',
  };

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${data.apiKey}`,
      // "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
    },
    body: JSON.stringify({
      model: data.model || models.gpt4omini,
      stream: false,
      messages: [{ role: 'user', content: data.content }],
    }),
  };

  try {
    const res = await fetch(url, options);
    if (res.status !== 200) {
      notify.error(String(res.status));
      return null;
    }
    const stream = await res.json();
    // error log
    return stream.choices?.[0]?.message.content;
  } catch (e) {
    console.error(e);
    return null;
  }
}
