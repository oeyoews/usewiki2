import { isProbablyReaderable, Readability } from '@mozilla/readability';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 发送文章信息到后台
    function sendArticle() {
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone);
      const article = reader.parse();

      // TODO: 路由变化似乎不会更新
      chrome.runtime.sendMessage(article);
      console.log(new Date(), article);
      browser.storage.local.set({
        article,
      });
    }

    sendArticle();
  },
});
