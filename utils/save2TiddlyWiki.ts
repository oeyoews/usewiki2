import { formattime } from './formattime';

const save2TiddlyWiki = async (
  title: string,
  text: string,
  port: number,
  url: string,
  tag: string[],
  status: any
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

  if (!status.tiddlywiki_version) {
    notify({
      message: '请先连接 TiddlyWiki',
      type: 'error',
    });
    return;
  }

  const currentTime = formattime(new Date());

  fetch(`http://localhost:${port}/recipes/default/tiddlers/${title}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    body: JSON.stringify({
      text,
      creator: status.username,
      type: 'text/markdown',
      url,
      created: currentTime,
      modified: currentTime,
      tags,
    }),
  })
    .then((res) => {
      if (res.ok) {
        notify({
          message: '保存成功',
          type: 'success',
        });
      }
    })
    .catch((e) => {
      notify({
        message: '保存失败' + e,
        type: 'error',
      });
    });
};

export default save2TiddlyWiki;
