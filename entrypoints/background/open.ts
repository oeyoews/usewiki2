import * as constant from '../../utils/constant';

export default function () {
  chrome.storage.sync.get('port', function (result) {
    if (result.port) {
      chrome.tabs.create({
        url: 'http://localhost:' + result.port,
      });
    } else {
      chrome.notifications.create({
        type: 'basic',
        title: constant.default_name,
        message: '请先连接 TiddlyWiki',
        iconUrl: constant.tiddlywiki_icon,
      });
    }
  });
}
