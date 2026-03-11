import { ElNotification as notify } from 'element-plus';

import { ofetch } from 'ofetch';
import { t } from '@/src/i18n';

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
        isOnline.value = true;
      } else {
        isOnline.value = false;
        if (response.status == 401) {
          notify({
            title: t('notify.incorrectCredentials'),
            type: 'error',
            position: 'bottom-right',
          });
        }
      }
    },
    async onRequestError({ error, request, response, options }) {
      isOnline.value = false;
      notify({
        title: t('notify.checkPort'),
        type: 'error',
        position: 'bottom-right',
        duration: 3000,
      });
    },
  });

  try {
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
  }
}
