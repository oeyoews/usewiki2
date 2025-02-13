/**
 * chatgpt
 * @param {Object} data - data
 * @param {string} data.baseurl - baseurl
 * @param {string} data.content - content
 * @param {string} data.model - model
 * @param {string} data.apiKey - model
 */
export async function useAi(data: any) {
  if (!navigator.onLine) return;
  const baseurl = data.baseurl || 'https://api.openai.com';
  const url = `${baseurl}/v1/chat/completions`;

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
    },
    body: JSON.stringify({
      model: data.model || models.gpt4omini,
      stream: false,
      messages: [{ role: 'user', content: data.content }],
    }),
  };

  try {
    const res = await fetch(url, options);
    const stream = await res.json();
    // error log
    return stream.choices?.[0]?.message.content;
  } catch (e) {
    console.error(e);
    return null;
  }
}
