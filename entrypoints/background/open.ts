import * as constant from '../../utils/constant';
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
      message: '请先连接 TiddlyWiki',
      iconUrl: constant.tiddlywiki_icon,
    });
  }
}
