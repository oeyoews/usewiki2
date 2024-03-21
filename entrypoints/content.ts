import { Readability } from '@mozilla/readability';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    // document.body.style.background = 'red';

    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    chrome.runtime.sendMessage(article);

    var port = chrome.runtime.connect();
  },
});
