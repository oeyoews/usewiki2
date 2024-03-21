export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener((reason) => {
    if (reason) {
      chrome.storage.local.set({
        apiSuggestions: ['tabs', 'storage', 'scripting'],
      });
      chrome.action.setBadgeText({
        text: 'OFF',
      });
    }
  });
});
