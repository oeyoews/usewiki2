import { ElMessage as notify } from 'element-plus';
import { ofetch } from 'ofetch';

export async function checkStatus(
  port: number,
  status: Ref<IStatus>,
  isChecking: Ref<boolean>
) {
  isChecking.value = true;
  const baseURL = `http://localhost:${port}`;
  const twFetch = ofetch.create({
    baseURL,
    async onRequestError({ request, response, options }) {
      notify({
        message: 'TiddlyWiki 未成功连接',
        type: 'error',
      });
    },
  });

  const data = await twFetch('/status').finally(() => {
    isChecking.value = false;
  });

  status.value = data;

  if (!data.tiddlywiki_version) {
    notify({
      message: 'TiddlyWiki 未连接',
      type: 'error',
    });
  } else {
    notify({
      message: 'TiddlyWiki 连接成功',
      type: 'success',
    });
  }
}
