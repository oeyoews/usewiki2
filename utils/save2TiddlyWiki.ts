import { formattime } from './formattime';
import { ElMessage as notify } from 'element-plus';
import { ofetch } from 'ofetch';

const save2TiddlyWiki = async (
  title: string,
  text: string,
  port: number,
  url: string,
  tag: string[],
  status: Ref<IStatus>
) => {
  const tags = tag
    .map(function (tag) {
      if (tag.includes(' ')) {
        return '[[' + tag + ']]';
      } else {
        return tag;
      }
    })
    .join(' ');

  if (!status.value.tiddlywiki_version) {
    notify({
      message: '请先连接 TiddlyWiki',
      type: 'error',
    });
    return;
  }

  const currentTime = formattime(new Date());

  const baseURL = `http://localhost:${port}`;
  const savetwFetch = ofetch.create({
    baseURL,
    retry: 0,
    async onResponse({ request, response, options }) {
      if (response.ok) {
        notify({
          message: '保存成功',
          type: 'success',
        });
      }
    },
    async onResponseError({ request, response, options }) {
      console.log('[fetch error]', response.status);
      notify({
        message: '保存失败' + response._data,
        type: 'error',
      });
    },
  });

  await savetwFetch(`/recipes/default/tiddlers/${title}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    body: {
      text,
      creator: status.value.username,
      type: 'text/markdown',
      url,
      created: currentTime,
      modified: currentTime,
      tags,
    },
  });
};

export default save2TiddlyWiki;
