<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import 'element-plus/es/components/message/style/css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/es/components/notification/style/css';
import 'element-plus/es/components/message-box/style/css';
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
    content:
      '你现在是一个标题优化助手，请你帮我优化: ' +
      title.value +
      ' 这个标题, 去除冗余信息,并且如果标题中含有斜杠， 就替换成短横线，仅仅输出优化后的标题即可.',
    baseurl: baseurl.value,
    apiKey: apiKey.value,
    // model: 'qwen2:0.5b',
  };
  let renameTitle = await useAi(data);
  if (renameTitle) {
    title.value = renameTitle.replace(/\//g, '-');
    notify.success('标题优化成功');
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
  isCheckTw5.value = true;
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
  isCheckTw5.value = await isCheckTw5Storage.getValue();
  if (isDev) {
    isCheckTw5.value = true;
  }

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

async function savePort(port: number) {
  if (!port) {
    notify({
      message: '请输入端口号',
      type: 'warning',
    });
    return;
  }
  // 检查端口号范围的合法性
  if (port < 0 || port > 65535) {
    notify({
      message: '端口号范围 0 - 65535',
      type: 'warning',
    });
    return;
  }

  await portStorage.setValue(port);
  if (isCheckTw5.value) {
    // 更新status
    await checkStatus(
      toRef(port),
      status,
      isChecking,
      username,
      password,
      isOnline
    );
  } else {
    notify({
      message: '保存成功',
      type: 'success',
      duration: 1500,
    });
  }
}

async function saveAuth(option: { username: string; password: string }) {
  // 检查用户名或者密码是否合法
  if (!option.username || !option.password) {
    notify({
      message: '请输入' + (option.username ? '密码' : '用户名'),
      type: 'warning',
    });
    return;
  }
  await authStorage.setValue(option);
  if (isCheckTw5.value) {
    await checkStatus(port, status, isChecking, username, password, isOnline);
  } else {
    notify({
      message: '保存成功',
      type: 'success',
      duration: 1500,
    });
  }
}

async function saveAi(option: { baseurl: string; apiKey: string }) {
  // 检查用户名或者密码是否合法
  if (!option.baseurl || !option.apiKey) {
    return;
  }
  await aiStorage.setValue(option);
  notify({
    message: '保存成功, 请重启',
    type: 'success',
    duration: 1500,
  });
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

const handleCommand = async (cmd: ICommand, components: any, e: MouseEvent) => {
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
    <div
      class="pointer-events-none absolute h-24 top-10 inset-x-0 hidden dark:block">
      <Meteors :number="20" />
    </div>
    <GridBg />
    <!-- @go-home="onGoHome" -->
    <!-- 使用v-if 如果拿不到ref, 可以借助nextTick -->
    <!-- ref="searchRef" -->
    <SearchPage
      v-model:is-home="isHome"
      :port
      v-if="!isHome" />
    <div
      class="backdrop-blur-sm z-[999] flex justify-end items-center inset-x-0 gap-1 p-2"
      v-if="isHome">
      <!-- <MenuBar :options="menuData" /> -->
      <!-- 下拉框 -->

      <el-button
        type="success"
        @click="addToTiddlyWikiAPP">
        {{ t('actions.save') }}
      </el-button>
      <Actions
        :isCheckTw5
        :command="handleCommand"
        :default-command="debounceSave" />
      <el-tag
        size="large"
        @click="setupDialogStatus = true">
        <WI.RiWifiFill
          class="text-emerald-600"
          v-if="isOnline" />
        <WI.MdiWifiOff
          class="text-rose-600"
          v-else />
      </el-tag>
    </div>
  </div>

  <div
    class="mx-2 fixed top-[50px] w-[95%]"
    v-if="isHome"
    @contextmenu="onContextMenu">
    <div v-show="isRead">
      <div
        class="flex items-center justify-center gap-2"
        v-if="title">
        <el-popover
          :width="300"
          raw-content
          :show-after="500">
          <!-- 鼠标悬停时显示的内容 -->
          <template #default>
            {{ title }}
          </template>
          <!-- 默认显示的内容 -->
          <template #reference>
            <h2 class="line-clamp-1 select-none">
              <a
                :href="link"
                target="_blank"
                v-if="link && faviconUrl">
                <img
                  alt=""
                  :src="faviconUrl"
                  class="rounded-full size-4 mr-2" />
              </a>
              <span @dblclick="getAiTitle">
                {{ title }}
              </span>
            </h2>
          </template>
        </el-popover>
      </div>

      <div class="mx-auto w-[80%]">
        <el-select
          ref="selectRef"
          v-model="newTags"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          style="width: 100%"
          placeholder="tags">
          <template #label="{ label, value }">
            <div style="display: flex; align-items: center">
              <!-- <span v-html="tagIcon"></span> -->
              <span style="margin-left: 4px">{{ value }}</span>
            </div>
          </template>
          <el-option
            v-for="item in allTags"
            :key="item"
            :label="item"
            :value="item" />
        </el-select>
      </div>

      <div
        class="prose-gray max-w-none prose-sm flex-wrap prose-img:max-w-[300px] prose-img:my-0 prose-img:rounded-md prose-video:max-w-[300px] prose-video:max-h-[300px] prose-video:my-0 prose-h2:my-2 prose-img:max-h-[300px] overflow-x-hidden h-[calc(100vh-120px)]">
        <div class="h-full overflow-x-hidden article">
          <el-scrollbar>
            <el-skeleton
              :loading
              animated
              :count="4"
              :throttle="100">
              <template #template>
                <div class="px-3 py-5">
                  <el-skeleton-item
                    variant="text"
                    class="!w-1/2" />
                  <el-skeleton-item
                    variant="p"
                    class="w-1/2 h-24" />
                  <div class="flex justify-between items-center">
                    <el-skeleton-item
                      variant="text"
                      class="mr-4" />
                    <el-skeleton-item
                      variant="text"
                      class="!w-1/4" />
                  </div>
                </div>
              </template>
            </el-skeleton>
            <div
              v-html="html"
              class="mx-2 overflow-x-hidden"></div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- edit -->
    <!-- :disabled="!isCheckTw5" -->
    <div v-show="!isRead">
      <ElInput
        type="text"
        size="large"
        v-model="title"
        class="mb-4" />

      <ElInput
        ref="editRef"
        placeholder="写点什么吧 ..."
        size="large"
        v-model="md"
        @keyup.enter.ctrl="handleSave"
        @input="debounceEdit"
        :autosize="{ minRows: 4, maxRows: 27 }"
        type="textarea"
        spellcheck="false"
        class="w-full border-none overflow-y"
        resize="none" />
    </div>

    <!-- setup -->
    <el-dialog
      v-model="setupDialogStatus"
      width="90%"
      align-center>
      <div class="items-center mx-2">
        <div>
          <h2>{{ t('setup.login') }}</h2>
          <div class="flex gap-2">
            <el-form
              size="large"
              :spellcheck="false"
              label-width="68px"
              label-position="top">
              <el-form-item label="用户名">
                <ElInput
                  v-model.trim.number="username"
                  :prefix-icon="WI.MingcuteUser4Line"
                  minlength="3"
                  maxlength="20"
                  show-word-limit
                  placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="密码">
                <ElInput
                  minlength="4"
                  maxlength="20"
                  :prefix-icon="WI.MynauiLockPassword"
                  v-model.trim.number="password"
                  type="password"
                  placeholder="请输入密码"
                  show-password />
              </el-form-item>
              <el-form-item label="">
                <ElButton
                  type="primary"
                  size="small"
                  plain
                  :disabled="isChecking"
                  @click="
                    saveAuth({
                      username,
                      password,
                    })
                  ">
                  保存
                </ElButton>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div>
          <h2>端口号</h2>
          <div class="flex gap-2">
            <!-- :prefix-icon="WI.GameIconsHole" -->
            <ElInput
              v-model.trim.number="port"
              size="large"
              maxlength="5"
              minlength="1"
              @keyup.enter="savePort(port)"
              placeholder="请输入端口号">
              <template #prepend>
                <el-select
                  size="large"
                  v-model="port"
                  placeholder="端口"
                  style="width: 98px">
                  <template v-for="(port, index) in ports">
                    <el-option
                      :label="`端口${index + 1} (${port})`"
                      :value="port" />
                  </template>
                </el-select>
              </template>
            </ElInput>
            <ElButton
              size="large"
              type="primary"
              plain
              @click="savePort(port)"
              :disabled="isChecking">
              保存
            </ElButton>
          </div>
        </div>

        <div v-show="isCheckTw5">
          <h2>标签</h2>
          <!-- tag -->
          <div class="flex gap-2">
            <ElTag
              size="large"
              v-for="tag in dynamicTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)">
              <div class="flex items-center gap-2">
                <WI.MdiTagOutline />
                {{ tag }}
              </div>
            </ElTag>
            <ElInput
              size="large"
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="w-20"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm" />

            <ElButton
              v-else
              class="button-new-tag"
              size="default"
              type="primary"
              plain
              @click="showInput">
              +
            </ElButton>
          </div>
        </div>

        <div>
          <h2>Openai API</h2>
          <div class="flex gap-2">
            <el-form
              size="large"
              :spellcheck="false"
              label-width="68px"
              label-position="top">
              <el-form-item label="baseurl">
                <ElInput
                  v-model.trim.string="baseurl"
                  :prefix-icon="WI.MingcuteUser4Line"
                  show-word-limit
                  placeholder="https://api.openai.com" />
              </el-form-item>
              <el-form-item label="apiKey">
                <ElInput
                  :prefix-icon="WI.MynauiLockPassword"
                  v-model.trim.string="apiKey"
                  type="password"
                  placeholder="sk-**********"
                  show-password />
              </el-form-item>
              <el-form-item label="">
                <ElButton
                  type="primary"
                  size="small"
                  plain
                  :disabled="isChecking"
                  @click="
                    saveAi({
                      baseurl,
                      apiKey,
                    })
                  ">
                  保存
                </ElButton>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <h2>连接TiddlyWiki5</h2>
        <el-switch
          size="large"
          :before-change="checkTwStatus"
          :loading="isChecking"
          inline-prompt
          v-model="isCheckTw5"
          :inactive-icon="WI.SimpleIconsTiddlywiki"
          :active-icon="WI.SimpleIconsTiddlywiki" />
      </div>
    </el-dialog>

    <el-dialog
      v-model="infoDialogStatus"
      width="80%"
      align-center>
      <Info
        :status
        :json="json" />
    </el-dialog>
  </div>
</template>

<style scoped lang="css">
::v-deep(.el-dialog) {
  border-radius: 15px;
}

/* ::v-deep(.el-tabs__content) {
  height: calc(100vh - 110px);
  padding: 5px 10px;
}

::v-deep(.el-tabs--border-card) {
  border-radius: 0 0 10px 10px;
} */

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 2147483646;
}
</style>
