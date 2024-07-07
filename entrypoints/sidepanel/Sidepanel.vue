<script setup lang="ts">
import Info from './components/Info.vue';
import 'element-plus/es/components/message/style/css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/es/components/notification/style/css';
import { formattime } from '@/utils/formattime';
import * as utils from '@/utils/utils';
import AI from '@/utils/ai';
import { copyMd } from '@/utils/copyMd';
// @ts-ignore
import json from '../../package.json';
import { debounce } from '@/utils/debounce';
import * as WI from '@/utils/icons';
import saveMarkdown from '@/utils/saveMarkdown';
import save2TiddlyWiki from '@/utils/save2TiddlyWiki';
import { html2md, md2html } from '@/utils/parser';
import { ElButton, ElMessage as notify } from 'element-plus';
import { checkStatus } from '@/utils/checkStatus';
import {
  isCheckTw5Storage,
  tagStorage,
  portStorage,
  authStorage,
  isDarkModeStorage,
} from '@/utils/storage';
// import getAI from '@/utils/openai';

const isDarkMode = ref(false);
const editRef = ref<HTMLInputElement>();
const isChecking = ref(false);
const currentTab = ref<ITabs>('preview');
const aimd = ref('');
const html = ref('');
const md = ref('');
const link = ref('');
const faviconUrl = ref('');
const title = ref('');
const isAIChecking = ref(false);
const GROQ_APIKEY = ref('');
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

const aihtml = ref('');
const infoDialogStatus = ref(false);

port.value = await portStorage.getValue();

const auth = await authStorage.getValue();

username.value = auth.username;
password.value = auth.password;

dynamicTags.value = Object.values(await tagStorage.getValue());

async function getContent(
  options = {
    tip: false,
  }
) {
  html.value = '';
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  const tab = tabs[0];
  link.value = tab.url!;
  faviconUrl.value = tab.favIconUrl!;
  const response = await browser.tabs.sendMessage(tab.id!, {
    info: 'get-doc',
    message: '获取文章',
  });

  html.value = response.content;
  md.value = await html2md(html.value);
  title.value = response.title;
  if (options.tip) {
    notify({
      message: '刷新成功',
      type: 'success',
      duration: 750,
    });
  }
}

onMounted(async () => {
  const isDark = await isDarkModeStorage.getValue();
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  if (isDark) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});

onMounted(async () => {
  getContent();

  isCheckTw5.value = await isCheckTw5Storage.getValue();
  if (isCheckTw5.value) {
    await checkStatus(port!, status, isChecking, username, password);
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

function addJournal() {
  md.value = '';
  isCheckTw5.value = true;
  title.value = formattime(new Date(), 'YYYY/MM/DD') + `-${utils.randomChar()}`;
  dynamicTags.value = ['Journal'];
  currentTab.value = 'edit';
  link.value = `#${title.value}`;

  // nextTick(() => { //   editRef.value?.focus(); // });
  // HACK: 由于弹出框的问题，导致 focus 后，unfocus
  setTimeout(() => {
    if (editRef.value) editRef.value.focus();
  }, 500);
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

// browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.info === 'tiddlywiki-send-message') {
//     console.log(request.message)
//   }
// })

const vanillaStatus: IStatus = {
  username: '',
  tiddlywiki_version: '',
};

const status = ref<IStatus>(vanillaStatus);

async function checkTwStatus() {
  // 关闭连接tw5时， 直接关闭， 不进行检查网络连接是否成功
  if (isCheckTw5.value) {
    status.value.tiddlywiki_version = '';
    status.value.username = '';
    await isCheckTw5Storage.setValue(false);
    return true;
  }

  await isCheckTw5Storage.setValue(true);
  const value = await isCheckTw5Storage.getValue();
  let res = false;
  res = await checkStatus(port!, status, isChecking, username, password);
  return res;
}

const debounceEdit = debounce(async function () {
  html.value = await md2html(md.value);
}, 300);

async function ai2md() {
  if (isAIChecking.value) {
    notify({
      message: '正在润色中 ...',
      type: 'warning',
    });
    return;
  }
  isAIChecking.value = true;

  const chatCompletion = await AI(md.value);
  if (!chatCompletion) {
    isAIChecking.value = false;
    return;
  }
  const mes = chatCompletion!.choices[0].message;
  notify({
    message: 'GROQ 润色成功',
    type: 'success',
  });
  currentTab.value = 'aipreview';
  aimd.value = mes.content;
  aihtml.value = await md2html(aimd.value);

  isAIChecking.value = false;
}

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
    await checkStatus(toRef(port), status, isChecking, username, password);
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
    await checkStatus(port, status, isChecking, username, password);
  } else {
    notify({
      message: '保存成功',
      type: 'success',
      duration: 1500,
    });
  }
}

// async function toggleDarkMode() {
//   isDarkMode.value = !isDarkMode.value;
//   await isDarkModeStorage.setValue(isDarkMode.value);
//   const DARK = 'dark';
//   if (isDarkMode.value) {
//     document.documentElement.classList.add(DARK);
//   } else {
//     document.documentElement.classList.remove(DARK);
//   }
// }

const isAppearanceTransition =
  // @ts-ignore
  document.startViewTransition &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
async function toggleDark(event?: MouseEvent) {
  const DARK = 'dark';
  if (!isAppearanceTransition || !event) {
    isDarkMode.value = !isDarkMode.value;
    await isDarkModeStorage.setValue(isDarkMode.value);
    return;
  }
  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  );
  // @ts-expect-error: Transition API
  const transition = document.startViewTransition(async () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
      document.documentElement.classList.add(DARK);
    } else {
      document.documentElement.classList.remove(DARK);
    }
    await nextTick();
  });
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];
    document.documentElement.animate(
      {
        clipPath: isDarkMode.value ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 250,
        easing: 'ease-in',
        pseudoElement: isDarkMode.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      }
    );
  });
}

const toggleInfoDialog = () => {
  infoDialogStatus.value = !infoDialogStatus.value;
};
</script>

<template>
  <!-- <el-empty v-if="!html" /> -->
  <!-- <el-skeleton
    style="width: 100%"
    :loading="html.length === 0"
    animated
    :throttle="800" /> -->
  <div class="inset-x-0 mb-4">
    <!-- bg-gray-200/50  -->
    <div
      class="backdrop-blur-lg z-[999] flex justify-center items-center inset-x-0 gap-1 p-2 rounded-md px-6">
      <el-tooltip
        content="详情"
        effect="light"
        placement="bottom">
        <ElButton
          @click="toggleInfoDialog"
          size="default"
          plain
          type="primary"
          class="aspect-square">
          <WI.OcticonInfo24 />
        </ElButton>
      </el-tooltip>

      <!-- darkmode -->
      <!-- :content="`切换到 ${isDarkMode ? '白天模式' : '夜间模式'}`" -->
      <el-tooltip
        effect="light"
        content="切换"
        placement="left">
        <ElButton
          @click="toggleDark"
          size="default"
          type="primary"
          plain
          class="aspect-square">
          <WI.FluentDarkTheme24Filled />
        </ElButton>
      </el-tooltip>

      <el-tooltip
        effect="light"
        content="重新获取内容"
        placement="bottom">
        <ElButton
          type="primary"
          plain
          size="default"
          class="aspect-square"
          @click="
            getContent({
              tip: true,
            })
          ">
          <WI.MdiCloudRefreshVariant />
        </ElButton>
      </el-tooltip>

      <el-tooltip
        content="下载"
        effect="light"
        placement="bottom">
        <ElButton
          @click="saveMarkdown(md, title!)"
          size="default"
          type="warning"
          plain
          class="aspect-square">
          <WI.MaterialSymbolsDownload />
        </ElButton>
      </el-tooltip>

      <!-- copy -->
      <el-tooltip
        effect="light"
        content="复制"
        placement="bottom">
        <ElButton
          @click="copyMd(md)"
          size="default"
          type="primary"
          plain
          class="aspect-square">
          <WI.ZondiconsCopy />
        </ElButton>
      </el-tooltip>

      <!-- ai -->
      <!--  <ElButton
          @click="ai2md"
          size="small"
          class="aspect-square"
          v-if="false">
          <WI.IconoirSpark :class="{ 'animate-spin': isAIChecking }" />
        </ElButton> -->

      <!-- journal -->
      <el-tooltip
        effect="light"
        content="写点什么吧"
        placement="bottom">
        <ElButton
          v-show="isCheckTw5"
          @click="addJournal"
          size="default"
          class="aspect-square"
          plain
          type="success">
          <WI.PhPencil />
        </ElButton>
      </el-tooltip>

      <!-- save to tiddlywiki -->
      <el-tooltip
        effect="light"
        content="保存到 TiddlyWiki"
        placement="bottom">
        <ElButton
          v-show="isCheckTw5"
          @click="handleSave"
          size="default"
          plain
          class="aspect-square">
          <WI.SimpleIconsTiddlywiki />
        </ElButton>
      </el-tooltip>
    </div>
  </div>

  <div>
    <ElTabs
      type="border-card"
      :model-value="currentTab">
      <!-- preview -->
      <ElTabPane
        name="preview"
        class="overflow-y-auto h-screen">
        <template #label>
          <WI.FaFileTextO /> <span class="ml-1">预览</span>
        </template>
        <div v-if="title">
          <div class="flex items-center justify-center gap-2">
            <h2>
              <a
                :href="link"
                target="_blank"
                v-if="link">
                <img
                  alt=""
                  :src="faviconUrl"
                  class="rounded-full size-4" />
              </a>
              {{ title }}
            </h2>
          </div>
          <!-- dark:prose-invert -->
          <article
            class="prose-gray max-w-none prose-sm flex-wrap prose-img:max-w-[300px] prose-img:my-0 prose-img:rounded-md prose-video:max-w-[300px] prose-video:max-h-[300px] prose-video:my-0">
            <div
              v-html="html"
              class="mx-2"></div>

            <!-- <el-backtop
              :right="50"
              :bottom="50" /> -->
          </article>
        </div>
      </ElTabPane>

      <!-- edit -->
      <ElTabPane
        name="edit"
        :disabled="!isCheckTw5">
        <template #label>
          <WI.FaRegularEdit />
          <span class="ml-1">编辑</span>
        </template>

        <ElInput
          type="text"
          v-model="title"
          class="mb-4" />

        <ElInput
          ref="editRef"
          placeholder="写点什么吧 ..."
          v-model="md"
          @keyup.enter.ctrl="handleSave"
          @input="debounceEdit"
          :autosize="{ minRows: 4, maxRows: 20 }"
          type="textarea"
          spellcheck="false"
          class="w-full"
          resize="none" />
      </ElTabPane>

      <!-- setup -->
      <ElTabPane>
        <template #label>
          <WI.LetsIconsSettingAltLine />
          <span class="ml-1">配置</span>
        </template>

        <div class="items-center mx-2">
          <div>
            <h2>登录</h2>
            <div class="flex gap-2">
              <el-form
                label-width="68px"
                label-position="top">
                <el-form-item label="用户名">
                  <ElInput
                    v-model.trim.number="username"
                    minlength="3"
                    maxlength="20"
                    show-word-limit
                    placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码">
                  <ElInput
                    minlength="4"
                    maxlength="20"
                    v-model.trim.number="password"
                    type="password"
                    placeholder="请输入密码"
                    show-password />
                </el-form-item>
                <el-form-item label="">
                  <ElButton
                    type="success"
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

          <h2>连接TiddlyWiki5</h2>
          <el-switch
            :before-change="checkTwStatus"
            :loading="isChecking"
            inline-prompt
            v-model="isCheckTw5"
            :inactive-icon="WI.SimpleIconsTiddlywiki"
            :active-icon="WI.SimpleIconsTiddlywiki" />

          <div>
            <h2>端口号</h2>
            <div class="flex gap-2">
              <ElInput
                v-model.trim.number="port"
                maxlength="5"
                minlength="1"
                type="number"
                placeholder="请输入端口号" />
              <ElButton
                type="success"
                plain
                @keyup.enter="savePort(port)"
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
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                size="default"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm" />

              <ElButton
                v-else
                class="button-new-tag"
                size="small"
                type="success"
                plain
                @click="showInput">
                +
              </ElButton>
            </div>
          </div>

          <!-- https://console.groq.com/keys -->
          <!-- <div class="hidden">
            <h2>GROQ API</h2>
            <div class="flex gap-1">
              <ElInput
                v-model.trim="GROQ_APIKEY"
                placeholder="**************"
                type="password" />
              <ElButton @click="utils.saveGROQAPIKEY(GROQ_APIKEY)"
                >保存</ElButton
              >

              <el-popconfirm
                title="你确定要重置API吗 ?"
                @confirm="utils.resetGROQAPIKEY">
                <template #reference>
                  <ElButton>重置</ElButton>
                </template>
              </el-popconfirm>
            </div>
        </div> -->
        </div>
      </ElTabPane>

      <el-dialog
        v-model="infoDialogStatus"
        width="80%"
        align-center>
        <Info
          :status="status"
          :json="json" />
      </el-dialog>
    </ElTabs>
  </div>
</template>

<style scoped lang="css">
::v-deep(.el-dialog) {
  border-radius: 15px;
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
