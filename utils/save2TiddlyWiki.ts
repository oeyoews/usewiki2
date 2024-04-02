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
  const baseURL = `http://localhost:${port}/recipes/default/tiddlers`;

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

  const savetwFetch = ofetch.create({
    baseURL,
    method: 'PUT',
    retry: 0,
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    async onResponse({ request, response, options }) {
      if (response.ok) {
        notify({
          message: '保存成功',
          type: 'success',
        });
      }
    },
    async onResponseError({ request, response, options }) {
      notify({
        message: '保存失败' + response._data,
        type: 'error',
      });
    },
  });

  const getTwFetch = ofetch.create({
    baseURL,
    method: 'GET',
    retry: 0,
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    async onResponse({ request, response, options }) {
      switch (response.status) {
        case 200:
          notify({
            message: `${title} 已存在`,
            type: 'error',
          });
          break;
        case 404:
          await savetwFetch(`/${title}`, {
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
          break;
        default:
          break;
      }
    },
  });

  await getTwFetch(`/${title}`);
};

export default save2TiddlyWiki;
