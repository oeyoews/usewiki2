import { ref } from 'vue';
import { html2md, md2html } from '@/utils/parser';
import { ElMessage as notify } from 'element-plus';

export function useContent() {
  const loading = ref<boolean>(false);
  const html = ref<string>('');
  const md = ref<string>('');
  const link = ref<string>('');
  const faviconUrl = ref<string>('');
  const title = ref<string>('');
  const textOver = ref<boolean>(false);

  const getContent = async (options = { tip: false }) => {
    loading.value = true;
    html.value = '';
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length === 0) {
      notify({
        message: '无法获取活动的选项卡',
        type: 'error',
        duration: 750,
      });
      loading.value = false;
      return;
    }

    const tab = tabs[0];
    link.value = tab.url!;
    faviconUrl.value = tab.favIconUrl!;

    try {
      const response = await browser.tabs.sendMessage(tab.id!, {
        type: 'get-doc',
        message: '获取文章',
      });

      html.value = response?.content || '';
      md.value = await html2md(html.value);

      if (!response?.title) {
        // notify({
        //   message: '暂无标题',
        //   type: 'warning',
        //   duration: 750,
        // });
        loading.value = false;
        return;
      }

      title.value = response.title;
      textOver.value = title.value.length > 30;

      if (options.tip) {
        notify({
          message: '刷新成功',
          type: 'success',
          duration: 750,
        });
      }
    } catch (error) {
      console.log(error);
      // notify({
      //   message: '无法建立连接',
      //   type: 'error',
      //   duration: 750,
      // });
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    html,
    md,
    link,
    faviconUrl,
    title,
    textOver,
    getContent,
  };
}
