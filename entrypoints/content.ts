import { isProbablyReaderable, Readability } from '@mozilla/readability';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    function getDoc() {
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone);
      const article = reader.parse();
      return article;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      sendResponse(getDoc());
    });
  },
});
