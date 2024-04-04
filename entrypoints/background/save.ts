import * as constant from '../../utils/constant';

export default function (tabId?: number) {
  chrome.notifications.create({
    type: 'basic',
    title: constant.default_name,
    message: '敬请期待',
    iconUrl: constant.tiddlywiki_icon,
  });
  return;
  if (!tabId) return;
  chrome.tabs.sendMessage(
    // @ts-ignore
    tabId,
    {
      info: 'get-doc',
      message: '获取文章',
    },
    async function (response: IArticle) {
      console.log(response);
      chrome.notifications.create({
        type: 'basic',
        title: constant.default_name,
        message: '敬请期待',
        iconUrl: constant.tiddlywiki_icon,
      });
    }
  );
}
