import { isProbablyReaderable, Readability } from '@mozilla/readability';

/* export default defineBackground(() => {
  function sendArticle() {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    // TODO: 路由变化似乎不会更新
    chrome.runtime.sendMessage(article);
    // console.log(new Date(), article);
    // browser.storage.local.set({
    //   article,
    // });
  }

  setInterval(() => {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const article = reader.parse();

    chrome.runtime.sendMessage({
      message: article,
    });
    console.log('background');
  }, 1000);

  browser.runtime.onInstalled.addListener(async (reason) => {
    // const url = browser.runtime.getURL('welcome/welcome.html');
    // await browser.tabs.create({ url });
  });
}); */

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    // Also fired on update and browser_update
    if (reason !== 'install') return;

    await browser.tabs.create({
      // @ts-expect-error
      url: browser.runtime.getURL('/welcome.html'),
      active: true,
    });
  });
});
