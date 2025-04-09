import { isProbablyReaderable, Readability } from '@mozilla/readability';

// 进入页面会执行的函数, 可以操作 DOM
export default defineContentScript({
  // matches: ['<all_urls>'],
  matches: ['https://*/*'],
  // not work 还是 不能重和？??
  exclude: ['https://google.com/*', 'https://bing.com/*', 'chrome://*'],
  runAt: 'document_start',
  main(ctx) {
    ctx.onInvalidated(() => {
      // console.log('更新')
    });
    // 检查是否为 tiddlywiki site, 向bg 发送消息
    document.addEventListener('DOMContentLoaded', () => {
      const meta = document.querySelector('meta[name="generator"]');
      // @ts-ignore
      if (meta && meta.content === 'TiddlyWiki') {
        // const version = document.querySelector(
        //   'meta[name="tiddlywiki-version"]'
        //   // @ts-ignore
        // )?.content;
        browser.runtime.sendMessage({
          type: 'tiddlywiki-send-message',
          // version,
        });
      } else {
        browser.runtime.sendMessage({ type: 'general-send-message' });
      }
    });

    // 提取页面文章内容
    function getDoc() {
      // 防止 parse 函数修改真实 dom
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone, {
        // charThreshold: 100000,
        charThreshold: 10,
      });
      const article = reader.parse();
      return article;
    }

    // 主进程监听消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // console.log(message);
      switch (message.type) {
        case 'get-doc':
          // @ts-ignore
          sendResponse(getDoc());
          break;
        case 'routeUpdate':
          // 通知 popup 更新内容
          browser.runtime.sendMessage({ type: 'routeUpdate', data: getDoc() });
          break;
        default:
          break;
      }
    });

    // chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    //   chrome.declarativeContent.onPageChanged.addRules([
    //     {
    //       conditions: [
    //         new chrome.declarativeContent.PageStateMatcher({
    //           // pageUrl: { schemes: ['https//'] },
    //           pageUrl: {
    //             hostEquals: 'www.tiddlywiki.com',
    //           },
    //         }),
    //       ],
    //       actions: [new chrome.declarativeContent.ShowPageAction()],
    //     },
    //   ]);
    // });

    // or use execsripting // scripting
    // window.addEventListener(
    //   'message',
    //   (event) => {
    //     if (event.data.key === 'tiddlywiki-send-message') {
    //       browser.runtime.sendMessage({
    //         info: event.data.key,
    //         message: event.data.message,
    //       });
    //     }
    //   },
    //   false
    // );

    // const s = document.createElement('script');
    // s.src = browser.runtime.getURL('/injected.js');
    // s.onload = () => s.remove();
    // (document.head || document.documentElement).appendChild(s);
  },
});
