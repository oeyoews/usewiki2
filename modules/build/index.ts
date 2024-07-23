import { defineWxtModule } from 'wxt/modules';

export default defineWxtModule((wxt) => {
  return;
  if (wxt.config.mode === 'development') {
    // Use the "ready" hook to update wxt.config
    wxt.hooks.hook('ready', (wxt) => {
      wxt.config.outDir = wxt.config.outDir.replace('.output', '.dev');
    });
  }
});
