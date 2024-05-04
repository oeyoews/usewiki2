<script setup lang="ts">
import Info from './components/Info.vue';
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
import { isCheckTw5Storage, tagStorage, portStorage } from '@/utils/storage';

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
const port = ref<number>();
const aihtml = ref('');

port.value = await portStorage.getValue();

isCheckTw5.value = await isCheckTw5Storage.getValue();

dynamicTags.value = Object.values(await tagStorage.getValue());

async function getContent(
  options = {
    tip: false,
  }
) {
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
    await checkStatus(port.value!, status, isChecking);
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
  await portStorage.setValue(port);
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
        <ElButton
          type="primary"
          plain
          size="small"
          class="aspect-square"
          @click="
            getContent({
              tip: true,
            })
          ">
          <WI.MdiCloudRefreshVariant />
        </ElButton>

        <ElButton
          @click="saveMarkdown(md, title!)"
          size="small"
          type="warning"
          plain
          class="aspect-square">
          <WI.MaterialSymbolsDownload />
        </ElButton>

        <!-- copy -->
        <ElButton
          @click="copyMd(md)"
          size="small"
          type="info"
          plain
          class="aspect-square">
          <WI.MdiContentCopy />
        </ElButton>

        <!-- ai -->
        <ElButton
          @click="ai2md"
          size="small"
          class="aspect-square"
          v-if="false">
          <WI.IconoirSpark :class="{ 'animate-spin': isAIChecking }" />
        </ElButton>

        <!-- journal -->
        <ElButton
          @click="addJournal"
          size="small"
          class="aspect-square"
          plain
          type="success"
          tooltip="添加到日记本">
          <WI.BiJournals />
        </ElButton>

        <!-- save to tiddlywiki -->
        <ElButton
          v-show="isCheckTw5"
          @click="handleSave"
          size="small"
          class="aspect-square">
          <WI.FaRegularSave />
        </ElButton>
      </div>
    </div>

    <ElTabs type="" :model-value="currentTab">
      <!-- preview -->
      <ElTabPane name="preview">
        <template #label>
          <WI.FaFileTextO /> <span class="ml-1">预览</span>
        </template>
        <div v-if="title">
          <div class="flex items-center justify-center gap-2">
            <h2>
              <a :href="link" target="_blank" v-if="link">
                <img alt="" :src="faviconUrl" class="rounded-full size-4" />
              </a>
              {{ title }}
            </h2>
          </div>
          <!-- <el-divider border-style="dashed" /> -->
          <article
            class="prose prose-gray max-w-none prose-sm dark:prose-invert flex-wrap prose-img:max-w-[300px] prose-img:my-0 prose-img:rounded-md prose-video:max-w-[300px] prose-video:max-h-[300px] prose-video:my-0">
            <div v-html="html" class="mx-2"></div>
          </article>
        </div>
      </ElTabPane>

      <!-- edit -->
      <ElTabPane name="edit">
        <template #label>
          <WI.FaRegularEdit />
          <span class="ml-1">编辑</span>
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

      <!-- setup -->
      <ElTabPane>
        <template #label>
          <WI.TdesignSetting />
          <span class="ml-1">配置</span>
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
              <ElButton type="success" plain @click="savePort(port!)"
                >保存</ElButton
              >
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
              type="success"
              plain
              @click="showInput">
              +
            </ElButton>
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

      <Info :status="status" :json="json" />
    </ElTabs>
  </div>
</template>
