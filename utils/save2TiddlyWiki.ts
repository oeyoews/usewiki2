import { formattime } from './formattime';
import { ElMessageBox, ElMessage as notify } from 'element-plus';
import { ofetch } from 'ofetch';
import * as constant from './constant';

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

  const tiddler = {
    text,
    creator: status.value.username,
    type: constant.markdown_type,
    url,
    created: currentTime,
    modified: currentTime,
    tags,
  };

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
  });

  const oldTiddler = await getTwFetch(`/${title}`, {
    async onResponse({ request, response, options }) {
      switch (response.status) {
        case 200:
          break;
        case 404:
          await savetwFetch(`/${title}`, {
            body: tiddler,
          });
          break;
        default:
          break;
      }
    },
  });

  if (oldTiddler?.text === text) {
    notify({
      message: h('div', [
        h('span', { style: { fontWeight: 'bold' } }, title),
        h('span', null, ' 没有新的变化，无需重复保存！'),
      ]),
      type: 'warning',
    });
  } else {
    ElMessageBox.confirm(`确定要覆盖 ${title} 吗`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        savetwFetch(`/${title}`, {
          body: tiddler,
        });
      })
      .catch(() => {
        notify({
          message: '已取消保存',
          type: 'info',
        });
      });
  }
};

export default save2TiddlyWiki;
