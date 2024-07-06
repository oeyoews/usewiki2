<script setup lang="ts">
import Info from './components/Info.vue';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/notification/style/css';
import { formattime } from '@/utils/formattime';
import * as utils from '@/utils/utils';
import AI from '@/utils/ai';
import { copyMd } from '@/utils/copyMd';
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
} from '@/utils/storage';
// import getAI from '@/utils/openai';

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
const username = ref('');
const password = ref('');
const aihtml = ref('');
const infoDialogStatus = ref(false);

port.value = await portStorage.getValue();

const auth = await authStorage.getValue();

username.value = auth.username;
password.value = auth.password;

isCheckTw5.value = await isCheckTw5Storage.getValue();

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

onMounted(() => {
  getContent();
  // getAI();
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

watchEffect(async () => {
  await isCheckTw5Storage.setValue(isCheckTw5.value);
  if (isCheckTw5.value) {
    await checkStatus(port!, status, isChecking, username, password);
  }
});

// watch(isCheckTw5, async (newValue) => {
//   if (newValue) {
//     await checkStatus(port.value!, status, isChecking);
//   } else {
//     status.value = vanillaStatus;
//   }
// });

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
      type: 'error',
    });
    return;
  }
  // 检查端口号范围的合法性
  if (port < 1024 || port > 65535) {
    notify({
      message: '端口号范围 1024 - 65535',
      type: 'error',
    });
    return;
  }

  await portStorage.setValue(port);
  if (isCheckTw5.value) {
    // 更新status
    checkStatus(toRef(port), status, isChecking, username, password);
  }
}

async function saveAuth(option: { username: string; password: string }) {
  // 检查用户名或者密码是否合法
  if (!option.username || !option.password) {
    notify({
      message: '请输入' + (option.username ? '密码' : '用户名'),
      type: 'error',
    });
    return;
  }
  await authStorage.setValue(option);
  if (password.value) {
    checkStatus(port, status, isChecking, username, password);
  }
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
    <div
      class="backdrop-blur-lg z-[999] flex justify-center items-center bg-gray-200/50 inset-x-0 gap-1 p-2 rounded-md px-6">
      <!-- class="group aspect-square hover:aspect-auto transition-all duration-800"> -->
      <el-tooltip
        content="详情"
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
      <el-tooltip
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
        content="写点什么吧"
        placement="bottom">
        <ElButton
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
          <!-- <el-divider border-style="dashed" /> -->
          <article
            class="prose prose-gray max-w-none prose-sm dark:prose-invert flex-wrap prose-img:max-w-[300px] prose-img:my-0 prose-img:rounded-md prose-video:max-w-[300px] prose-video:max-h-[300px] prose-video:my-0">
            <div
              v-html="html"
              class="mx-2"></div>
          </article>
        </div>
      </ElTabPane>

      <!-- edit -->
      <ElTabPane name="edit">
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
          <WI.TdesignSetting />
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

          <div class="hidden">
            <h2>GROQ API</h2>
            <div class="flex gap-1">
              <!-- https://console.groq.com/keys -->

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
          </div>
        </div>
      </ElTabPane>

      <!-- <el-drawer
        v-model="infoDialogStatus"
        direction="btt"
        title=""> -->
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
