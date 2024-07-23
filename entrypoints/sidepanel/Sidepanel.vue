<script setup lang="ts">
import 'element-plus/es/components/message/style/css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/es/components/notification/style/css';
import 'element-plus/es/components/message-box/style/css';
import GridBg from '@/components/GridBg.vue';
import Actions from './components/Actions.vue';
import Info from './components/Info.vue';
import { formattime } from '@/utils/formattime';
import * as utils from '@/utils/utils';
import constant from '@/utils/constant';
import { copyMd } from '@/utils/copyMd';
// @ts-ignore
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
  isDarkModeStorage,
} from '@/utils/storage';
import { useContent } from '@/hooks/useContent';

const isHome = ref(true);
const { loading, html, md, link, faviconUrl, title, getContent } = useContent();
const { isDarkMode, toggleDark } = useDarkMode();

const isOnline = ref(false);
const ports = [8000, 8080, 8001, 8081];
// const devMode = import.meta.env.DEV;
const editRef = ref<HTMLInputElement>();
const isChecking = ref(false);
const currentTab = ref<ITabs>('preview');
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

const infoDialogStatus = ref(false);
const setupDialogStatus = ref(false);

loading.value = true;

port.value = await portStorage.getValue();

const auth = await authStorage.getValue();

username.value = auth.username;
password.value = auth.password;

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
  getContent();

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
    dynamicTags.value,
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
  currentTab.value = 'edit';
  link.value = `#${title.value}`;

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
      if (request.type === 'routeUpdate') {
        // Feature: 弹窗提示页面更新
        await getContent();
      }
    }
  );
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

const handleCommand = async (cmd: string, components: any, e: MouseEvent) => {
  switch (cmd) {
    case 'journal':
      addJournal();
      break;
    case 'info':
      infoDialogStatus.value = !infoDialogStatus.value;
      break;
    case 'setup':
      setupDialogStatus.value = true;
      break;
    case 'copy':
      copyMd(md.value);
      break;
    case 'download':
      saveMarkdown(md.value, title.value!);
      break;
    case 'refresh':
      getContent({ tip: true });
      break;
    case 'darkmode':
      await toggleDark(e);
      break;
    default:
      break;
  }
};

// const onGoHome = () => {
//   console.log('go home');
//   isHome.value = true;
// };

// const searchRef = ref<InstanceType<typeof SearchPage> | null>(null);
</script>

<template>
  <div class="inset-x-0 top-0 fixed">
    <GridBg />
    <!-- @go-home="onGoHome" -->
    <!-- ref="searchRef" -->
    <SearchPage
      v-model:is-home="isHome"
      :port
      v-if="!isHome" />
    <div
      class="backdrop-blur-sm z-[999] flex justify-end items-center inset-x-0 gap-1 p-2 px-6"
      v-if="isHome">
      <!-- 下拉框 -->
      <el-button
        @click="isHome = false"
        size="default"
        type="primary"
        plain
        >进入太微</el-button
      >
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
    v-if="isHome">
    <ElTabs
      stretch
      type="border-card"
      :model-value="currentTab">
      <!-- preview -->
      <ElTabPane
        name="preview"
        class="overflow-y-auto h-[calc(100vh-105px)]">
        <template #label>
          <WI.FaFileTextO /> <span class="ml-1">预览</span>
        </template>

        <div>
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
                <h2 class="line-clamp-1">
                  <a
                    :href="link"
                    target="_blank"
                    v-if="link && faviconUrl">
                    <img
                      alt=""
                      :src="faviconUrl"
                      class="rounded-full size-4" />
                  </a>
                  {{ title }}
                </h2>
              </template>
            </el-popover>
          </div>

          <div
            class="prose-gray max-w-none prose-sm flex-wrap prose-img:max-w-[300px] prose-img:my-0 prose-img:rounded-md prose-video:max-w-[300px] prose-video:max-h-[300px] prose-video:my-0 prose-h2:my-2 prose-img:max-h-[300px] overflow-x-hidden h-[calc(100vh-160px)]">
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
      </ElTabPane>

      <!-- edit -->
      <!-- :disabled="!isCheckTw5" -->
      <ElTabPane name="edit">
        <template #label>
          <WI.FaRegularEdit />
          <span class="ml-1">编辑</span>
        </template>

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
      </ElTabPane>

      <!-- setup -->
      <el-dialog
        v-model="setupDialogStatus"
        width="90%"
        align-center>
        <div class="items-center mx-2">
          <div>
            <h2>登录</h2>
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
                :disabled="isChecking"
                >保存</ElButton
              >
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
    </ElTabs>
  </div>
</template>

<style scoped lang="css">
::v-deep(.el-dialog) {
  border-radius: 15px;
}

::v-deep(.el-tabs__content) {
  height: calc(100vh - 110px);
  padding: 5px 10px;
}

::v-deep(.el-tabs--border-card) {
  border-radius: 0 0 10px 10px;
}

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
.dark::view-transition-old(root) {
  z-index: 2147483646;
}
.dark::view-transition-new(root) {
  z-index: 1;
}
</style>
