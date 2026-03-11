import { Readability } from '@mozilla/readability';

// Function executed when entering a page, can manipulate DOM
export default defineContentScript({
  // matches: ['<all_urls>'],
  matches: ['https://*/*'],
  // not work, still can't overlap?
  exclude: ['https://google.com/*', 'https://bing.com/*', 'chrome://*'],
  runAt: 'document_start',
  main(ctx) {
    ctx.onInvalidated(() => {
      // console.log('updated')
    });
    // Check if it's a TiddlyWiki site, send message to background
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

    // Extract page article content
    function getDoc() {
      // Prevent parse function from modifying the real DOM
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone, {
        // charThreshold: 100000,
        charThreshold: 10,
      });
      const article = reader.parse();
      return article;
    }

    // Main process listens for messages
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // console.log(message);
      switch (message.type) {
        case 'get-doc':
          // @ts-ignore
          sendResponse(getDoc());
          break;
        case 'routeUpdate':
          // Notify popup to update content
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
