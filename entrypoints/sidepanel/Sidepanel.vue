<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import 'element-plus/es/components/message/style/css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/es/components/notification/style/css';
import 'element-plus/es/components/message-box/style/css';
import 'element-plus/es/components/scrollbar/style/css';
import GridBg from '@/components/GridBg.vue';
import Actions, { type ICommand } from './components/Actions.vue';
import Info from './components/Info.vue';
import { formattime } from '@/utils/formattime';
import * as utils from '@/utils/utils';
import constant from '@/utils/constant';
import { copyMd } from '@/utils/copyMd';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import json from '../../package.json';
import { debounce } from '@/utils/debounce';
import * as WI from '@/utils/icons';
import saveMarkdown from '@/utils/saveMarkdown';
import save2TiddlyWiki from '@/utils/save2TiddlyWiki';
import { md2html } from '@/utils/parser';
import { ElButton, ElMessage as notify } from 'element-plus';
import { checkStatus } from '@/utils/checkStatus';
import { isDev } from '@/utils/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import SearchPage from './components/SearchPage.vue';
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue';
import {
  isCheckTw5Storage,
  tagStorage,
  portStorage,
  authStorage,
  aiStorage,
  isDarkModeStorage,
} from '@/utils/storage';
import { useContent } from '@/hooks/useContent';

import ContextMenu from '@imengyu/vue3-context-menu';
import Meteors from '@/components/Meteors.vue';
import { useAi } from '@/hooks/useAi';
import { ofetch } from 'ofetch';
import type { ILocales, MessageSchema } from '@/src/i18n';

const { t, locale } = useI18n<[messages: MessageSchema], ILocales>();

const toggleLocale = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('locale', locale.value);
};

const isHome = ref(true);
const isRead = ref(true);
const { loading, html, md, link, faviconUrl, title, getContent } = useContent();
const { isDarkMode, toggleDark } = useDarkMode();
const mousePosition = ref<MouseEvent>();
const allTags = ref([]);
const newTags = ref([]);

const isOnline = ref(false);
const ports = [8000, 8080, 8001, 8081];
// const devMode = import.meta.env.DEV;
const editRef = ref<HTMLInputElement>();
const isChecking = ref(false);
const isCheckTw5 = ref(false); // 是否连接tw
const inputVisible = ref(false);
const InputRef = ref();
const inputValue = ref();
const dynamicTags = ref();
const port = ref<number>(8000);
/** tiddlywiki 登录认证 用户名*/
const username = ref('');
/** tiddlywiki 登录认证 密码*/
const password = ref('');

const baseurl = ref('');
const apiKey = ref('');

const infoDialogStatus = ref(false);
const setupDialogStatus = ref(false);

loading.value = true;

port.value = await portStorage.getValue();

const auth = await authStorage.getValue();
const ai = await aiStorage.getValue();

// auth
username.value = auth.username;
password.value = auth.password;

// ai
baseurl.value = ai.baseurl;
apiKey.value = ai.apiKey;

async function getAiTitle() {
  if (!baseurl.value || !apiKey.value) return;
  const data = {
    content: t('editor.titleOptimizationPrompt', { title: title.value }),
    baseurl: baseurl.value,
    apiKey: apiKey.value,
    // model: 'qwen2:0.5b',
  };
  let renameTitle = await useAi(data);
  if (renameTitle) {
    title.value = renameTitle.replace(/\//g, '-');
    notify.success(t('editor.titleOptimization'));
  }
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  //show our menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDarkMode.value ? 'dark' : 'light',
    // onClickOnOutside: () => {
    //   notify('关闭');
    // },
    clickCloseOnOutside: true, // 点击关闭右键菜单
    items: [
      {
        label: t('actions.sync'),
        onClick: handleSave,
        icon: h(WI.FaRegularSave),
        divided: true,
      },
      {
        label: t('actions.refresh'),
        onClick: actions.refresh,
        icon: h(WI.MdiCloudRefreshVariant),
      },
      {
        label: t('actions.copy'),
        onClick: actions.copy,
        icon: h(WI.MdiContentCopy),
      },
      {
        label: t('actions.journal'),
        onClick: actions.journal,
        icon: h(WI.PhPencil),
      },
      {
        label: t('actions.darkmode'),
        onClick: (e: any) => actions.darkmode(e),
        icon: h(WI.FluentDarkTheme24Filled),
      },
      {
        label: t('actions.more'),
        icon: h(WI.CharmMenuMeatball),
        children: [
          {
            label: t('actions.settings'),
            onClick: actions.setup,
            icon: h(WI.TdesignSetting),
          },
          {
            label: t('actions.edit'),
            onClick: actions.edit,
            icon: h(WI.CharmBookOpen),
          },
          {
            label: t('actions.info'),
            onClick: actions.info,
            icon: h(WI.MaterialSymbolsInfoOutline),
          },
          {
            label: t('actions.tiddlywiki'),
            onClick: actions.tiddlywiki,
            icon: h(WI.SimpleIconsTiddlywiki),
          },
          {
            label: locale.value === 'zh' ? 'English' : 'Chinese',
            onClick: toggleLocale,
            icon: h(WI.MaterialIconThemeI18n),
          },
        ],
      },
      // {
      //   label: 'A submenu',
      //   children: [{ label: 'Item1' }, { label: 'Item2' }, { label: 'Item3' }],
      // },
    ],
  });
}

// TODO: 适配
async function addToTiddlyWikiAPP() {
  const TWProtocol = 'tiddlywiki://';
  const tiddler = {
    title: title.value.replace(/[|]/g, '-'),
    // text: md.value,
    created: new Date().toISOString().replace(/\D/g, ''),
    modified: new Date().toISOString().replace(/\D/g, ''),
    type: 'text/markdown',
    creator: username.value || 'usewiki2',
    modifier: username.value || 'usewiki2',
    link: link.value,
  };
  // 或者逗号隔开处理
  const tags = [...dynamicTags.value, ...newTags.value];
  const params = new URLSearchParams({
    _source: 'web',
    ...tiddler,
  });
  tags.forEach((item) => {
    params.append('tags', item);
  });
  await navigator.clipboard.writeText(md.value);
  const url = `${TWProtocol}?${params.toString()}`;
  openTWAPP(url);
}

function openTWAPP(url: string): void {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.id) {
      browser.tabs.update(currentTab.id, { url: url });
    }
  });
}

// devmode
if (isDev) {
  port.value = constant.devPort;
  username.value = constant.devUsername;
  password.value = constant.devUsername;
}

dynamicTags.value = Object.values(await tagStorage.getValue());

onMounted(async () => {
  // const bg = chrome.extension.getBackgroundPage();
  // // @ts-ignore
  // bg!.popUp();
  let isDark = await isDarkModeStorage.getValue();
  if (isDev) {
    isDark = true;
  }
  if (isDark) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});

onMounted(async () => {
  getContent().then(() => {
    getAiTitle();
  });
  isCheckTw5.value = (await isCheckTw5Storage.getValue()) ?? false;

  if (isCheckTw5.value) {
    await checkStatus(port!, status, isChecking, username, password, isOnline);
  }
});

const handleSave = () =>
  save2TiddlyWiki(
    title.value,
    md.value,
    port.value!,
    link.value,
    [...dynamicTags.value, ...newTags.value],
    status,
    username,
    password
  );

const debounceSave = debounce(handleSave, 500);

function addJournal() {
  md.value = '';
  isCheckTw5.value = true;
  title.value = formattime(new Date(), 'YYYY/MM/DD') + `-${utils.randomChar()}`;
  dynamicTags.value = ['Journal'];
  link.value = `#${title.value}`;
  isRead.value = false;

  nextTick(() => {
    if (editRef.value) editRef.value.focus();
  });
}

const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleInputConfirm = async () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value.trim());
    await tagStorage.setValue(toRaw(dynamicTags.value));
  }
  inputVisible.value = false;
  inputValue.value = '';
};

// 监听路由变化，自动更新页面
onMounted(async () => {
  browser.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      // @ts-ignore
      if (request.type === 'routeUpdate') {
        // Feature: 弹窗提示页面更新
        await getContent();
        // await getAiTitle(); // 并发太高
      }
    }
  );
});

// TODO: 检查是否安装了插件
onMounted(async () => {
  const token = 'Basic ' + btoa(username.value + ':' + password.value);
  const getTwTagsFetch = ofetch.create({
    method: 'Get',
    retry: 0,
    // baseURL: `http://localhost:${port.value}/recipes/default`,
    baseURL: `http://localhost:${port.value}`,
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
      Authorization: token,
    },
    async onResponseError({ request, response, options }) {
      console.log(response, request);
    },
  });
  const path = encodeURIComponent(
    '$:/plugins/oeyoews/neotw-tag-route/tags.json'
  );
  const res = await getTwTagsFetch(path, {
    // params: {
    //   filter: '[!is[system]tags[]!prefix[$:/]]',
    // },
  });
  allTags.value = res.text.split(',');
});

const vanillaStatus: IStatus = {
  username: '',
  tiddlywiki_version: '',
};

// tiddlywiki status field
const status = ref<IStatus>(vanillaStatus);

async function checkTwStatus() {
  // 关闭连接tw5时， 直接关闭， 不进行检查网络连接是否成功
  if (isCheckTw5.value) {
    status.value.tiddlywiki_version = '';
    status.value.username = '';
    isOnline.value = false;
    await isCheckTw5Storage.setValue(false);
    return true;
  }

  await isCheckTw5Storage.setValue(true);
  let res = false;
  res = await checkStatus(
    port!,
    status,
    isChecking,
    username,
    password,
    isOnline
  );
  return res;
}

const debounceEdit = debounce(async function () {
  html.value = await md2html(md.value);
}, 300);

const handleEditorKeyUp = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    handleSave();
  }
};

/** 配置弹窗底部一键保存：端口必填；账号与 API 仅在填写完整时写入 */
async function saveAllSettings() {
  if (isChecking.value) return;

  const rawPort = port.value;
  if (rawPort === null || rawPort === undefined || Number.isNaN(Number(rawPort))) {
    notify({
      message: t('setup.enterPort'),
      type: 'warning',
    });
    return;
  }
  const p = Number(rawPort);
  if (p < 0 || p > 65535) {
    notify({
      message: t('setup.portRange'),
      type: 'warning',
    });
    return;
  }

  if (username.value || password.value) {
    if (!username.value || !password.value) {
      notify({
        message: t('setup.enterUsernameOrPassword', {
          field: username.value ? t('setup.password') : t('setup.username'),
        }),
        type: 'warning',
      });
      return;
    }
  }

  await portStorage.setValue(p);

  if (username.value && password.value) {
    await authStorage.setValue({
      username: username.value,
      password: password.value,
    });
  }

  let aiSaved = false;
  if (baseurl.value && apiKey.value) {
    await aiStorage.setValue({
      baseurl: baseurl.value,
      apiKey: apiKey.value,
    });
    aiSaved = true;
  }

  if (isCheckTw5.value) {
    await checkStatus(port, status, isChecking, username, password, isOnline);
  }

  if (aiSaved) {
    notify({
      message: t('setup.saveSuccessRestart'),
      type: 'success',
      duration: 1500,
    });
  } else if (!isCheckTw5.value) {
    notify({
      message: t('setup.saveSuccess'),
      type: 'success',
      duration: 1500,
    });
  }
}

const actions: Record<
  ICommand,
  (e: MouseEvent | KeyboardEvent | undefined) => void
> = {
  tiddlywiki: () => {
    isHome.value = !isHome.value;
  },
  journal: addJournal,
  info: () => {
    infoDialogStatus.value = !infoDialogStatus.value;
  },
  setup: () => {
    setupDialogStatus.value = true;
  },
  copy: () => copyMd(md.value),
  download: () => saveMarkdown(md.value, title.value!),
  refresh: () => getContent({ tip: true }),
  darkmode: (e: any) => toggleDark(e || mousePosition.value),
  edit: () => {
    isRead.value = !isRead.value;
  },
};

const handleCommand = async (cmd: ICommand, _: any, e: MouseEvent) => {
  actions[cmd](e);
};

// const onGoHome = () => {
//   console.log('go home');
//   isHome.value = true;
// };

// const searchRef = ref<InstanceType<typeof SearchPage> | null>(null);
</script>

<template>
  <div class="inset-x-0 top-0 fixed">
    <div class="pointer-events-none absolute h-24 top-10 inset-x-0 hidden dark:block">
      <Meteors :number="20" />
    </div>
    <GridBg />
    <!-- @go-home="onGoHome" -->
    <!-- 使用v-if 如果拿不到ref, 可以借助nextTick -->
    <!-- ref="searchRef" -->
    <SearchPage v-model:is-home="isHome" :port v-if="!isHome" />
    <div class="backdrop-blur-sm z-[999] flex justify-end items-center inset-x-0 gap-1 p-2" v-if="isHome">
      <!-- <MenuBar :options="menuData" /> -->
      <!-- 下拉框 -->

      <el-button type="success" @click="addToTiddlyWikiAPP">
        {{ t('actions.save') }}
      </el-button>
      <Actions :isCheckTw5 :command="handleCommand" :default-command="debounceSave" />
      <el-tag size="large" @click="setupDialogStatus = true">
        <WI.RiWifiFill class="text-emerald-600" v-if="isOnline" />
        <WI.MdiWifiOff class="text-rose-600" v-else />
      </el-tag>
    </div>
  </div>

  <div class="mx-2 fixed top-[50px] w-[95%]" v-if="isHome" @contextmenu="onContextMenu">
    <div v-show="isRead">
      <div class="flex items-center justify-center gap-2" v-if="title">
        <el-popover :width="300" raw-content :show-after="500" popper-class="max-h-[250px] overflow-y-auto">
          <!-- 鼠标悬停时显示的内容 -->
          <template #default>
            <div class="max-h-[200px] overflow-y-auto">
              {{ title }}
            </div>
          </template>
          <!-- 默认显示的内容 -->
          <template #reference>
            <h2 class="line-clamp-1 select-none">
              <a :href="link" target="_blank" v-if="link && faviconUrl">
                <img alt="" :src="faviconUrl" class="rounded-full size-4 mr-2" />
              </a>
              <span @dblclick="getAiTitle">
                {{ title }}
              </span>
            </h2>
          </template>
        </el-popover>
      </div>

      <div class="mx-auto w-[80%]">
        <el-select ref="selectRef" v-model="newTags" multiple filterable allow-create default-first-option
          :reserve-keyword="false" class="w-full" :placeholder="t('setup.tags')">
          <template #label="{ value }">
            <div class="flex items-center">
              <span class="ml-1">{{ value }}</span>
            </div>
          </template>
          <el-option v-for="item in allTags" :key="item" :label="item" :value="item" />
        </el-select>
      </div>

      <div
        class="prose-gray max-w-none prose-sm flex-wrap prose-img:max-w-[300px] prose-img:my-0 prose-img:rounded-md prose-video:max-w-[300px] prose-video:max-h-[300px] prose-video:my-0 prose-h2:my-2 prose-img:max-h-[300px] overflow-x-hidden h-[calc(100vh-120px)]">
        <div class="h-full overflow-x-hidden overflow-y-auto article">
          <el-skeleton :loading animated :count="4" :throttle="100">
            <template #template>
              <div class="px-3 py-5">
                <el-skeleton-item variant="text" class="!w-1/2" />
                <el-skeleton-item variant="p" class="w-1/2 h-24" />
                <div class="flex justify-between items-center">
                  <el-skeleton-item variant="text" class="mr-4" />
                  <el-skeleton-item variant="text" class="!w-1/4" />
                </div>
              </div>
            </template>
          </el-skeleton>
          <div v-html="html" class="mx-2 overflow-x-hidden"></div>
        </div>
      </div>
    </div>

    <!-- edit -->
    <!-- :disabled="!isCheckTw5" -->
    <div v-show="!isRead">
      <ElInput type="text" size="large" v-model="title" class="mb-4" />

      <div class="flex h-[calc(100vh-120px)] w-full flex-col overflow-hidden rounded-lg">
        <!-- <h3 class="editor-title">{{ t('editor.markdownEditor') }}</h3> -->
        <CodeMirrorEditor ref="editRef" v-model="md" :placeholder="t('editor.placeholder')" :dark-mode="isDarkMode"
          :font-size="'16px'" @change="debounceEdit" @keyup="handleEditorKeyUp" class="flex-1" />
      </div>
    </div>

    <!-- setup -->
    <el-dialog
      fullscreen
      v-model="setupDialogStatus"
      :show-close="false"
      class="setup-dialog-surface !m-0 !rounded-none !p-0 [&_.el-dialog]:flex [&_.el-dialog]:h-full [&_.el-dialog]:min-h-0 [&_.el-dialog]:flex-col [&_.el-dialog]:overflow-hidden [&_.el-dialog__header]:!hidden [&_.el-dialog__body]:box-border [&_.el-dialog__body]:flex [&_.el-dialog__body]:min-h-0 [&_.el-dialog__body]:flex-1 [&_.el-dialog__body]:flex-col [&_.el-dialog__body]:overflow-hidden [&_.el-dialog__body]:px-0 [&_.el-dialog__body]:pb-0 [&_.el-dialog__body]:pt-0">
      <div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-3 pb-0 pt-4 sm:px-4">
        <div class="min-h-0 flex-1 overflow-hidden">
          <el-scrollbar class="!h-full min-h-0" height="100%" wrap-class="overscroll-contain">
            <section
              class="mb-3 last:mb-2.5 rounded-[10px] border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-blank)] p-3 shadow-[0_1px_2px_rgb(0_0_0_/_6%)] dark:shadow-[0_1px_3px_rgb(0_0_0_/_38%)]">
            <h2
              class="mb-2.5 flex items-center gap-2 text-[13px] font-semibold leading-snug tracking-wide text-[var(--el-text-color-secondary)]">
              <WI.MdiLogin class="size-4 shrink-0 text-[var(--el-color-primary)]" aria-hidden="true" />
              {{ t('setup.login') }}
            </h2>
            <el-form
              class="w-full [&_.el-form-item]:mb-3 [&_.el-form-item:last-child]:mb-0"
              size="default"
              :spellcheck="false"
              label-position="top">
              <el-form-item :label="t('setup.username')">
                <ElInput v-model.trim="username" class="w-full" :prefix-icon="WI.MingcuteUser4Line" minlength="3"
                  maxlength="20" show-word-limit :placeholder="t('setup.enterUsername')" />
              </el-form-item>
              <el-form-item :label="t('setup.password')">
                <ElInput v-model.trim="password" class="w-full" minlength="4" maxlength="20"
                  :prefix-icon="WI.MynauiLockPassword" type="password" :placeholder="t('setup.enterPassword')"
                  show-password />
              </el-form-item>
            </el-form>
          </section>

          <section
            class="mb-3 last:mb-2.5 rounded-[10px] border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-blank)] p-2.5 shadow-[0_1px_2px_rgb(0_0_0_/_6%)] dark:shadow-[0_1px_3px_rgb(0_0_0_/_38%)]">
            <h2
              class="mb-1 flex items-center gap-2 text-[13px] font-semibold leading-snug tracking-wide text-[var(--el-text-color-secondary)]">
              <WI.MdiLan class="size-4 shrink-0 text-[var(--el-color-primary)]" aria-hidden="true" />
              {{ t('setup.port') }}
            </h2>
            <p class="mb-1.5 text-[11px] leading-snug text-[var(--el-text-color-secondary)]">
              {{ t('setup.portPreset') }}
            </p>
            <div class="mb-2 grid grid-cols-4 gap-1.5" role="group" :aria-label="t('setup.portPreset')">
              <ElButton
                v-for="presetPort in ports"
                :key="presetPort"
                size="small"
                :type="port === presetPort ? 'primary' : 'default'"
                :plain="port !== presetPort"
                class="!m-0 min-w-0 w-full justify-center tabular-nums"
                @click="port = presetPort">
                {{ presetPort }}
              </ElButton>
            </div>
            <ElInput
              class="w-full rounded-md"
              v-model.trim.number="port"
              size="default"
              maxlength="5"
              minlength="1" @keyup.enter="saveAllSettings" :placeholder="t('setup.enterPort')"
              :aria-label="t('setup.port')" />
          </section>

          <section
            v-show="isCheckTw5"
            class="mb-3 last:mb-2.5 rounded-[10px] border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-blank)] p-3 shadow-[0_1px_2px_rgb(0_0_0_/_6%)] dark:shadow-[0_1px_3px_rgb(0_0_0_/_38%)]">
            <h2
              class="mb-2.5 flex items-center gap-2 text-[13px] font-semibold leading-snug tracking-wide text-[var(--el-text-color-secondary)]">
              <WI.MdiTagOutline class="size-4 shrink-0 text-[var(--el-color-primary)]" aria-hidden="true" />
              {{ t('setup.tags') }}
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <ElTag
                v-for="tag in dynamicTags"
                :key="tag"
                size="small"
                closable
                :disable-transitions="false"
                class="!m-0 inline-flex h-8 max-h-8 min-h-8 items-center border py-0 leading-none"
                @close="handleClose(tag)">
                <span class="inline-flex items-center gap-1.5">
                  <WI.MdiTagOutline class="size-3.5 shrink-0" />
                  {{ tag }}
                </span>
              </ElTag>
              <ElInput
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                size="small"
                class="!m-0 h-8 w-[7.5rem] min-w-[5.5rem]"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm" />

              <ElButton
                v-else
                size="small"
                type="primary"
                plain
                class="!m-0 inline-flex h-8 w-8 min-h-8 min-w-8 items-center justify-center !p-0 font-semibold leading-none"
                @click="showInput">
                +
              </ElButton>
            </div>
          </section>

          <section
            class="mb-3 last:mb-2.5 rounded-[10px] border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-blank)] p-3 shadow-[0_1px_2px_rgb(0_0_0_/_6%)] dark:shadow-[0_1px_3px_rgb(0_0_0_/_38%)]">
            <h2
              class="mb-2.5 flex items-center gap-2 text-[13px] font-semibold leading-snug tracking-wide text-[var(--el-text-color-secondary)]">
              <WI.MdiSparklesOutline class="size-4 shrink-0 text-[var(--el-color-primary)]" aria-hidden="true" />
              {{ t('setup.ai') }}
            </h2>
            <el-form
              class="w-full [&_.el-form-item]:mb-3 [&_.el-form-item:last-child]:mb-0"
              size="default"
              :spellcheck="false"
              label-position="top">
              <el-form-item :label="t('setup.baseurl')">
                <ElInput v-model.trim="baseurl" class="w-full" :prefix-icon="WI.MingcuteUser4Line" show-word-limit
                  placeholder="https://api.openai.com" />
              </el-form-item>
              <el-form-item :label="t('setup.apiKey')">
                <ElInput :prefix-icon="WI.MynauiLockPassword" v-model.trim="apiKey" class="w-full" type="password"
                  placeholder="sk-**********" show-password />
              </el-form-item>
            </el-form>
          </section>

          <section
            class="mb-3 last:mb-2.5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-blank)] p-3 shadow-[0_1px_2px_rgb(0_0_0_/_6%)] dark:shadow-[0_1px_3px_rgb(0_0_0_/_38%)]">
            <h2
              class="m-0 flex min-w-0 flex-1 items-center gap-2 text-[13px] font-semibold leading-snug tracking-wide text-[var(--el-text-color-secondary)]">
              <WI.SimpleIconsTiddlywiki class="size-4 shrink-0 text-[var(--el-color-primary)]" aria-hidden="true" />
              {{ t('setup.connect') }}
            </h2>
            <el-switch size="default" :before-change="checkTwStatus" :loading="isChecking" inline-prompt
              v-model="isCheckTw5" :inactive-icon="WI.SimpleIconsTiddlywiki" :active-icon="WI.SimpleIconsTiddlywiki" />
          </section>
          </el-scrollbar>
        </div>
        <div
          class="mt-auto shrink-0 border-t border-[var(--el-border-color-lighter)] bg-[var(--el-bg-color)] pt-2.5 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgb(0_0_0_/_6%)] dark:shadow-[0_-4px_16px_rgb(0_0_0_/_35%)]">
          <div class="flex items-stretch gap-2.5">
            <ElButton size="large" class="shrink-0" @click="setupDialogStatus = false">
              {{ t('setup.close') }}
            </ElButton>
            <ElButton
              type="primary"
              size="large"
              class="min-w-0 flex-1"
              :loading="isChecking"
              @click="saveAllSettings">
              {{ t('setup.save') }}
            </ElButton>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="infoDialogStatus" width="80%" align-center>
      <Info :status :json="json" />
    </el-dialog>
  </div>
</template>
