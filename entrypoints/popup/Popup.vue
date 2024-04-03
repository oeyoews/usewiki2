<script setup lang="ts">
import 'element-plus/es/components/message/style/css';
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
import { ElMessage as notify } from 'element-plus';
import { checkStatus } from '@/utils/checkStatus';

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
const isCheckTw5 = ref(false);
const inputVisible = ref(false);
const InputRef = ref();
const inputValue = ref();
const dynamicTags = ref();
const port = ref<number | undefined>();
const aihtml = ref('');

chrome.storage.local.get('port', function (result) {
  port.value = result.port || '8080';
});

chrome.storage.local.get('isCheckTw5', function (result) {
  isCheckTw5.value = result.isCheckTw5;
});

chrome.storage.local.get(['tags'], function (result) {
  if (result.tags) {
    dynamicTags.value = Object.values(result.tags);
  } else {
    dynamicTags.value = ['剪藏'];
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0];
  link.value = tab.url!;
  faviconUrl.value = tab.favIconUrl!;
  chrome.tabs.sendMessage(
    // @ts-ignore
    tab.id,
    {
      info: 'get-doc',
      message: '获取文章',
    },
    async function (response: IArticle) {
      html.value = response.content;
      md.value = await html2md(html.value);
      title.value = response.title;
    }
  );
});

const handleSave = () =>
  save2TiddlyWiki(
    title.value,
    md.value,
    port.value!,
    link.value,
    dynamicTags.value,
    status
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

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value.trim());
    chrome.storage.local.set({ tags: toRaw(dynamicTags.value) });
  }
  inputVisible.value = false;
  inputValue.value = '';
};

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.info === 'tiddlywiki-send-message') {
//     console.log(request.message)
//   }
// })

const vanillaStatus: IStatus = {
  username: '',
  tiddlywiki_version: '',
};

const status = ref<IStatus>(vanillaStatus);

watch(isCheckTw5, async (newValue) => {
  chrome.storage.local.set({ isCheckTw5: newValue });
  if (newValue) {
    await checkStatus(port.value!, status, isChecking);
  } else {
    status.value = vanillaStatus;
  }
});

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

function savePort(port: number) {
  chrome.storage.local.set({ port });
  if (isCheckTw5.value) {
    checkStatus(port, status, isChecking);
  }
}
</script>

<template>
  <div class="overflow-y-auto">
    <div class="sticky inset-x-0 top-0 backdrop-blur-sm rounded-md mb-2 z-10">
      <div class="flex justify-end">
        <!-- <ElBacktop :right="100" :bottom="100" /> -->
        <ElButton @click="saveMarkdown(md, title!)">
          <WI.MaterialSymbolsDownload />
        </ElButton>

        <!-- copy -->
        <ElButton @click="copyMd(md)">
          <WI.MdiContentCopy />
        </ElButton>

        <!-- ai -->
        <ElButton @click="ai2md">
          <WI.IconoirSpark :class="{ 'animate-spin': isAIChecking }" />
        </ElButton>

        <!-- journal -->
        <ElButton @click="addJournal">
          <WI.BiJournals />
        </ElButton>

        <!-- save to tiddlywiki -->
        <ElButton v-show="isCheckTw5" @click="handleSave">
          <WI.FaRegularSave />
        </ElButton>
      </div>
    </div>

    <ElTabs type="border-card" :model-value="currentTab">
      <!-- preview -->
      <ElTabPane name="preview">
        <template #label>
          <WI.FaFileTextO />
        </template>
        <div v-if="title">
          <div class="flex items-center justify-center gap-2">
            <h2>
              <a :href="link" target="_blank" v-if="link">
                <img :src="faviconUrl" class="rounded-full size-4" />
              </a>
              {{ title }}
            </h2>
          </div>
          <el-divider border-style="dashed" />
          <article
            class="prose prose-gray max-w-none prose-sm dark:prose-invert">
            <div v-html="html"></div>
          </article>
        </div>
      </ElTabPane>

      <!-- edit -->
      <ElTabPane name="edit">
        <template #label>
          <WI.FaRegularEdit />
        </template>

        <ElInput type="text" v-model="title" class="mb-1" />

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

      <!-- aimd preview -->
      <ElTabPane name="aipreview" v-if="aihtml">
        <template #label>
          <WI.MdiSparklesOutline />
        </template>
        <div v-if="title">
          <div class="flex items-center justify-center gap-2">
            <h2>
              <a :href="link" target="_blank" v-if="link">
                <img :src="faviconUrl" class="rounded-full size-4" />
              </a>
              {{ title }}
            </h2>
          </div>
          <el-divider border-style="dashed" />
          <article
            class="prose prose-gray max-w-none prose-sm dark:prose-invert">
            <div v-html="aihtml"></div>
          </article>
        </div>
      </ElTabPane>

      <!-- AI edit MD -->
      <ElTabPane v-if="aimd" name="aiedit">
        <template #label>
          <WI.StreamlineAiEditSparkSolid />
        </template>
        <el-input
          v-model="aimd"
          :autosize="{ minRows: 4, maxRows: 20 }"
          type="textarea"
          spellcheck="false"
          class="w-full"
          resize="none" />
        <div class="flex gap-2 items-center justify-end">
          <ElButton @click="copyMd(aimd)" class="mt-1">
            <WI.MdiContentCopy />
          </ElButton>
        </div>
      </ElTabPane>

      <!-- setup -->
      <ElTabPane>
        <template #label>
          <WI.TdesignSetting />
        </template>

        <div class="items-center">
          <h2>连接到 Nodejs TiddlyWiki5</h2>
          <el-switch
            v-model="isCheckTw5"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            " />

          <div>
            <h2>Nodejs TiddlyWiki5 端口</h2>
            <div class="flex gap-2">
              <ElInput v-model.trim.number="port" />
              <ElButton @click="savePort(port!)">保存</ElButton>
            </div>
          </div>
          <h2>剪藏标签</h2>
          <!-- tag -->
          <div class="flex gap-2">
            <ElTag
              v-for="tag in dynamicTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)">
              {{ tag }}
            </ElTag>
            <ElInput
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="w-20"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm" />

            <ElButton
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput">
              +
            </ElButton>
          </div>

          <h2>GROQ API</h2>
          <!-- https://console.groq.com/keys -->

          <div class="flex gap-1">
            <ElInput
              v-model.trim="GROQ_APIKEY"
              placeholder="**************"
              type="password" />
            <ElButton @click="utils.saveGROQAPIKEY(GROQ_APIKEY)">保存</ElButton>

            <el-popconfirm
              title="你确定要重置API吗 ?"
              @confirm="utils.resetGROQAPIKEY">
              <template #reference>
                <ElButton>重置</ElButton>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </ElTabPane>

      <!-- info -->
      <ElTabPane v-if="status.tiddlywiki_version">
        <template #label>
          <WI.MaterialSymbolsInfoOutline />
        </template>

        <div class="flex items-center gap-2 flex-wrap">
          <ElTag> TiddlyWiki5: {{ status.tiddlywiki_version }} </ElTag>
          <ElTag type="success"> Username: {{ status.username }} </ElTag>
          <ElTag> {{ json.name.toUpperCase() }}: {{ json.version }} </ElTag>
          <ElLink href="https://github.com/oeyoews/usewiki2" target="_blank">
            <WI.CharmGithub />
          </ElLink>
        </div>
      </ElTabPane>
    </ElTabs>
  </div>
</template>
