export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason !== 'install') return;

    await browser.tabs.create({
      url: browser.runtime.getURL('/welcome.html'),
      active: true,
    });
  });
});
