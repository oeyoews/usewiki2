import constant from '../../utils/constant';

export default function (tabId?: number) {
  browser.notifications.create({
    type: 'basic',
    title: constant.default_name,
    message: chrome.i18n.getMessage('comingSoon'),
    iconUrl: constant.tiddlywiki_icon,
  });
  return;
  if (!tabId) return;
  browser.tabs.sendMessage(
    // @ts-ignore
    tabId,
    {
      info: 'get-doc',
      message: 'get-doc',
    },
    async function (response: IArticle) {
      console.log(response);
      browser.notifications.create({
        type: 'basic',
        title: constant.default_name,
        message: chrome.i18n.getMessage('comingSoon'),
        iconUrl: constant.tiddlywiki_icon,
      });
    }
  );
}
