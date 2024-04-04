import { isProbablyReaderable, Readability } from '@mozilla/readability';

export default defineContentScript({
  // matches: ['<all_urls>'],
  matches: ['https://*/*'],
  // not work 还是 不能重和？??
  exclude: ['https://google.com/*', 'https://bing.com/*', 'chrome://*'],
  runAt: 'document_start',
  main() {
    // 检查是否为 tiddlywiki site
    document.addEventListener('DOMContentLoaded', () => {
      const meta = document.querySelector('meta[name="generator"]');
      // @ts-ignore
      if (meta && meta.content === 'TiddlyWiki') {
        // const version = document.querySelector(
        //   'meta[name="tiddlywiki-version"]'
        //   // @ts-ignore
        // )?.content;
        chrome.runtime.sendMessage({
          info: 'tiddlywiki-send-message',
          // version,
        });
      } else {
        chrome.runtime.sendMessage({ info: 'general-send-message' });
      }
    });

    function getDoc() {
      const documentClone = document.cloneNode(true) as Document;

      const reader = new Readability(documentClone);
      const article = reader.parse();
      return article;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.info === 'get-doc') {
        sendResponse(getDoc());
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

    // or use execsripting
    // scripting
    //   window.addEventListener(
    //     'message',
    //     (event) => {
    //       if (event.data.key === 'tiddlywiki-send-message') {
    //         chrome.runtime.sendMessage({
    //           info: event.data.key,
    //           message: event.data.message,
    //         });
    //       }
    //     },
    //     false
    //   );

    //   const s = document.createElement('script');
    //   s.src = browser.runtime.getURL('/injected.js');
    //   s.onload = () => s.remove();
    //   (document.head || document.documentElement).appendChild(s);
  },
});
