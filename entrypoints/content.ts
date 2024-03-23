import { isProbablyReaderable, Readability } from '@mozilla/readability';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    function getDoc() {
      const documentClone = document.cloneNode(true) as Document;
      // const readerable = isProbablyReaderable(documentClone);
      // if (!readerable) {
      //   return readerable;
      // }
      const reader = new Readability(documentClone);
      const article = reader.parse();
      return article;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.info === 'get-doc') {
        sendResponse(getDoc());
      }
    });

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
