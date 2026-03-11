import constant from '../../utils/constant';
import { portStorage } from '../../utils/storage';

export default async function () {
  const port = await portStorage.getValue();

  if (port) {
    browser.tabs.create({
      url: 'http://localhost:' + port,
    });
  } else {
    browser.notifications.create({
      type: 'basic',
      title: constant.default_name,
      message: chrome.i18n.getMessage('notifConnectFirst'),
      iconUrl: constant.tiddlywiki_icon,
    });
  }
}
