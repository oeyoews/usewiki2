import { formattime } from './formattime';
import { ElMessageBox, ElMessage as notify } from 'element-plus';
import { ofetch } from 'ofetch';
import constant from './constant';
import { t } from '@/src/i18n';

const save2TiddlyWiki = async (
  title: string,
  text: string,
  port: number,
  url: string,
  tag: string[],
  status: Ref<IStatus>,
  username: Ref<string>,
  password: Ref<string>
) => {
  if (!title) {
    notify({
      message: t('notify.titleEmpty'),
      type: 'warning',
    });
    return;
  }
  if (!text) {
    notify({ message: t('notify.contentEmpty'), type: 'warning' });
    return;
  }

  // todo localhost
  const baseURL = `http://localhost:${port}/recipes/default/tiddlers`;

  if (!status.value.tiddlywiki_version) {
    notify({
      message: t('notify.connectFirst'),
      type: 'warning',
    });
    return;
  }

  const currentTime = formattime(new Date());

  const tiddler = {
    text,
    creator: status.value.username,
    type: constant.markdown_type,
    url,
    created: currentTime,
    modified: currentTime,
    tags: tag,
  };

  const token = 'Basic ' + btoa(username.value + ':' + password.value);
  const savetwFetch = ofetch.create({
    baseURL,
    method: 'PUT',
    retry: 0,
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
      Authorization: token,
    },
    async onResponse({ request, response, options }) {
      if (response.ok) {
        notify({
          message: t('notify.saveSuccess'),
          type: 'success',
          duration: 1500,
        });
      }
    },
    async onResponseError({ request, response, options }) {
      notify({
        message: t('notify.saveFailed') + response._data,
        type: 'error',
        duration: 2000,
      });
    },
  });

  const getTwFetch = ofetch.create({
    baseURL,
    method: 'GET',
    retry: 0,
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
      Authorization: token,
    },

    async onResponse({ request, response, options }) {
      switch (response.status) {
        case 200:
          break;
        case 401:
          notify({
            message: response.statusText,
          });
          break;
        case 404:
          await savetwFetch(`/${title}`, {
            body: tiddler,
          });
          break;
        default:
          notify({
            message: response.statusText,
          });
          break;
      }
    },
  });

  try {
    const oldTiddler = await getTwFetch(`/${title}`);
    if (oldTiddler?.text === text) {
      notify({
        message: h('div', [
          h('span', null, t('notify.noRepeatSave')),
        ]),
        type: 'warning',
      });
    } else {
      ElMessageBox.confirm(
        t('notify.confirmOverwrite', { title }),
        t('notify.warning'),
        {
          confirmButtonText: t('notify.confirm'),
          cancelButtonText: t('notify.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          savetwFetch(`/${title}`, {
            body: tiddler,
          });
        })
        .catch(() => {
          notify({
            message: t('notify.cancelledSave'),
            type: 'info',
          });
        });
    }
  } catch (error) {}
};

export default save2TiddlyWiki;
