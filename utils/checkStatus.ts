import { ElMessage as notify } from 'element-plus';

export function checkStatus(
  port: number,
  status: Ref<IStatus>,
  isChecking: Ref<boolean>
) {
  isChecking.value = true;
  const url = `http://localhost:${port}/status`;
  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (!data) {
        return;
      }
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
    })

    .catch((e) => {
      notify({
        message: 'TiddlyWiki 未成功连接' + e,
        type: 'error',
      });
    })
    .finally(() => {
      isChecking.value = false;
    });
}
