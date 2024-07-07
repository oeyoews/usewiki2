import { ElNotification as notify } from 'element-plus';

import { ofetch } from 'ofetch';

// 如果设置了username, password, 进行登录, 保存的时候应该也需要？
export async function checkStatus(
  port: Ref<number>,
  status: Ref<IStatus>,
  isChecking: Ref<boolean>,
  username: Ref<string>,
  password: Ref<string>,
  isOnline: Ref<boolean>
) {
  const baseURL = `http://localhost:${port.value}`;
  const token = 'Basic ' + btoa(username.value + ':' + password.value);

  isChecking.value = true;

  const twFetch = ofetch.create({
    baseURL,
    retry: 0,
    headers: {
      Authorization: token,
    },
    onResponse({ request, response, options }) {
      if (response.ok) {
        // notify({
        //   title: '连接成功',
        //   type: 'success',
        //   position: 'bottom-left',
        //   showClose: false,
        //   duration: 1500,
        // });
        isOnline.value = true;
      } else {
        isOnline.value = false;
        if (response.status == 401) {
          // response.statusText,
          notify({
            title: '请设置正确的用户名和密码',
            type: 'error',
            position: 'bottom-right',
          });
        }
      }
    },
    async onRequestError({ error, request, response, options }) {
      isOnline.value = false;
      notify({
        //  + error.message,
        title: '请检查端口号是否正确',
        type: 'error',
        position: 'bottom-right',
        duration: 3000,
      });
    },
  });

  try {
    // if (isChecking.value) {
    //   return;
    // }
    const data = await twFetch('/status');
    status.value = data;
    isChecking.value = false;
    if (data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    isChecking.value = false;
    return false;
    // notify({
    //   title: '请设置用户名和密码',
    //   type: 'error',
    //   position: 'bottom-right',
    // });
  }
}
