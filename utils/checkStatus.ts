import { ElNotification as notify } from 'element-plus';

import { ofetch } from 'ofetch';

// 如果设置了username, password, 进行登录, 保存的时候应该也需要？
export async function checkStatus(
  port: Ref<number>,
  status: Ref<IStatus>,
  isChecking: Ref<boolean>,
  username: Ref<string>,
  password: Ref<string>
) {
  const baseURL = `http://localhost:${port.value}`;
  const token = 'Basic ' + btoa(username.value + ':' + password.value);

  isChecking.value = true;

  const twFetch = ofetch.create({
    baseURL,
    retry: 1,
    headers: {
      Authorization: token,
    },
    onResponse({ request, response, options }) {
      if (response.ok) {
        notify({
          title: '连接成功',
          type: 'success',
          position: 'bottom-right',
        });
      } else {
        if (response.status == 401) {
          // response.statusText,
          notify({
            title: '请设置用户名和密码',
            type: 'error',
            position: 'bottom-right',
          });
        }
      }
    },
    async onRequestError({ request, response, options }) {
      notify({
        title: response?.statusText,
        type: 'error',
      });
    },
  });

  try {
    const data = await twFetch('/status');
    status.value = data;
  } catch (error) {
    // notify({
    //   title: '请设置用户名和密码',
    //   type: 'error',
    //   position: 'bottom-right',
    // });
  }
  isChecking.value = false;
}
