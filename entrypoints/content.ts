import { Readability } from '@mozilla/readability';

export default defineContentScript({
  // matches: ['*://*/*'],
  matches: ['<all_urls>'],
  main() {
    // document.body.style.background = 'red';

    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    setInterval(() => {
      chrome.runtime.sendMessage(article);
      console.log('update');
    }, 1000);

    var port = chrome.runtime.connect();
  },
});
