import { ElNotification as notify } from 'element-plus';

import { ofetch } from 'ofetch';

// 如果设置了username, password, 进行登录, 保存的时候应该也需要？
export async function checkStatus(
  port: number,
  status: Ref<IStatus>,
  isChecking: Ref<boolean>
) {
  isChecking.value = true;
  const baseURL = `http://localhost:${port}`;
  const twFetch = ofetch.create({
    baseURL,
    retry: 0,
    onResponse({ request, response, options }) {
      if (response.ok) {
        notify({
          title: '连接成功',
          type: 'success',
          position: 'bottom-right',
        });
      }
    },
    async onRequestError({ request, response, options }) {
      notify({
        title: '连接失败',
        type: 'error',
      });
    },
  });

  const data = await twFetch('/status').finally(() => {
    isChecking.value = false;
  });

  status.value = data;
}
