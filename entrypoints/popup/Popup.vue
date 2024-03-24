<script setup lang="ts">
import 'element-plus/es/components/message/style/css'

import AI from '@/utils/ai'

import json from '../../package.json'

// @ts-ignore
import MdiSparklesOutline from '~icons/mdi/sparkles-outline?width=16px&height=16px';
// @ts-ignore
import MdiContentCopy from '~icons/mdi/content-copy?width=16px&height=16px';
// @ts-ignore
import EosIconsAi from '~icons/eos-icons/ai?width=16px&height=16px';
// @ts-ignore
import CharmGithub from '~icons/charm/github?width=16px&height=16px';
// @ts-ignore
import MaterialSymbolsDownload from '~icons/material-symbols/download';
// @ts-ignore
import FaRegularEdit from '~icons/fa-regular/edit';
// @ts-ignore
import TdesignSetting from '~icons/tdesign/setting';
// @ts-ignore
import MaterialSymbolsInfoOutline from '~icons/material-symbols/info-outline';
// @ts-ignore
import FaFileTextO from '~icons/fa/file-text-o';
// @ts-ignore
import FaRegularSave from '~icons/fa-regular/save';

import saveMarkdown from '@/utils/saveMarkdown';
import save2TiddlyWiki from '@/utils/save2TiddlyWiki';
import { html2md, md2html } from '@/utils/parser';

const currentTab = ref('preview');
const aimd = ref('')
const html = ref('')
const md = ref('')
const link = ref('')
const faviconUrl = ref('')
const title = ref('')
const isAIChecking = ref(false)

const GROQ_APIKEY = ref('')
const isCheckTw5 = ref(false)
const inputVisible = ref(false)
const InputRef = ref()
const inputValue = ref()
const dynamicTags = ref()
const port = ref<number | undefined>()

chrome.storage.local.get('isCheckTw5', function (result) {
  isCheckTw5.value = result.isCheckTw5
})

chrome.storage.local.get(['tags'], function (result) {
  if (result.tags) {
    dynamicTags.value = Object.values(result.tags)
  } else {
    dynamicTags.value = ['剪藏']
  }
});

function copyMd(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage({
    message: '复制成功',
    type: "success"
  })
}

function saveGROQAPIKEY() {
  if (!GROQ_APIKEY.value) {
    ElMessage({
      type: 'error',
      message: '请输入 GROQ API KEY'
    })
    return
  }
  chrome.storage.local.set({ GROQ_APIKEY: GROQ_APIKEY.value })
  ElMessage({
    type: 'success',
    message: '保存成功'
  })
}

function resetGROQAPIKEY() {
  chrome.storage.local.remove('GROQ_APIKEY')
  ElMessage({
    type: 'success',
    message: '已成功重置 GROQ API KEY'
  })
}

const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}
const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value.trim())
    chrome.storage.local.set({ tags: toRaw(dynamicTags.value) })
  }
  inputVisible.value = false
  inputValue.value = ''
}


chrome.storage.local.get('port', function (result) {
  port.value = result.port || '8080'
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0]
  link.value = tab.url!;
  faviconUrl.value = tab.favIconUrl!
  // @ts-ignore
  chrome.tabs.sendMessage(tab.id, {
    info: 'get-doc', message: '获取文章'
  }, async function (response: IArticle) {
    html.value = response.content
    md.value = await html2md(html.value);
    title.value = response.title
  })
})

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.info === 'tiddlywiki-send-message') {
//     console.log(request.message)
//   }
// })

const status = ref<{
  username: string, tiddlywiki_version: string
}>({
  username: '',
  tiddlywiki_version: ''
})

watch(isCheckTw5, (newValue, oldValue) => {
  chrome.storage.local.set({ isCheckTw5: newValue })

  if (newValue) {
    // ElMessage({
    //   message: '检测到 TiddlyWiki 5.x',
    //   type: 'success'
    // })
    checkStatus()
  } else {
    // @ts-ignore
    // 清空 status
    status.value = ''
    // ElMessage({
    //   message: '关闭 TiddlyWiki 5.x 检测',
    //   type: 'info'
    // })
  }
})

const isChecking = ref(false)
function checkStatus() {

  if (isChecking.value) {
    ElMessage({
      message: "正在检测中 ..."
    })
    return
  } else if (!port.value) {
    // ElMessage({
    //   message: "加载中 ..."
    // })
    return
  }

  isChecking.value = true

  const url = `http://localhost:${port.value}/status`
  fetch(url).then((res) => {
    return res.json()
  }).then((data) => {
    if (!data) {
      return
    }
    status.value = data

    if (!data.tiddlywiki_version) {
      ElMessage({
        message: 'TiddlyWiki 未连接',
        type: 'error'
      })
    } else {
      ElMessage({
        message: 'TiddlyWiki 连接成功',
        type: 'success'
      })
    }
  }).catch((e) => {
    ElMessage({
      message: "TiddlyWiki 未成功连接" + e,
      type: 'error'
    })
  }).finally(() => {
    isChecking.value = false
  })

}

watch(md, async () => {
  html.value = (await md2html(md.value))

})

async function ai2md() {
  if (isAIChecking.value) {
    ElMessage({
      message: "正在润色中 ...",
      type: 'warning'
    })
    return;
  }
  isAIChecking.value = true

  const chatCompletion = await AI(md.value);
  if (!chatCompletion) {
    isAIChecking.value = false
  }
  const mes = chatCompletion!.choices[0].message;
  ElMessage({
    message: 'GROQ 润色成功',
    type: 'success'
  })
  currentTab.value = 'ai'
  aimd.value = mes.content;

  isAIChecking.value = false;
}

watch(port, (newValue) => {
  chrome.storage.local.set({ port: newValue })
  if (isCheckTw5.value) {
    checkStatus()
  }
})

</script>

<template>
  <div class="overflow-y-auto w-[600px] h-[550px]">

    <div class="sticky inset-x-0 top-0 backdrop-blur-sm rounded-md mb-2 z-10">
      <div class="flex justify-end">

        <!-- <ElBacktop :right="100" :bottom="100" /> -->
        <ElButton @click="saveMarkdown(md, title!)">
          <ElIcon>
            <MaterialSymbolsDownload />
          </ElIcon>
        </ElButton>

        <ElButton @click="copyMd(md)">
          <ElIcon>
            <MdiContentCopy />
          </ElIcon>

        </ElButton>

        <ElButton @click="ai2md">
          <MdiSparklesOutline :class="{ 'animate-spin': isAIChecking }" />
        </ElButton>

        <ElButton @click="save2TiddlyWiki(title, md, port!, link, dynamicTags, status)">
          <FaRegularSave />
        </ElButton>
      </div>
    </div>


    <ElTabs type="border-card" :model-value="currentTab">
      <ElTabPane name="preview">
        <template #label>
          <ElIcon>
            <FaFileTextO />
          </ElIcon>
        </template>
        <!-- preview -->
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
          <article class="prose prose-gray max-w-none prose-sm dark:prose-invert">
            <div v-html="html"></div>
          </article>
        </div>
      </ElTabPane>

      <!-- edit -->
      <ElTabPane name="edit">
        <template #label>
          <FaRegularEdit />
        </template>

        <el-input type="text" v-model="title" class="mb-1" />

        <el-input placeholder="写点什么吧 ..." v-model="md" :autosize="{ minRows: 4, maxRows: 20 }" type="textarea"
          spellcheck="false" class="w-full" resize="none" />

      </ElTabPane>

      <!-- AIMD -->
      <ElTabPane v-if="aimd" name="ai">
        <template #label>
          <EosIconsAi />
        </template>
        <el-input v-model="aimd" :autosize="{ minRows: 4, maxRows: 20 }" type="textarea" spellcheck="false" class="w-full"
          resize="none" />

        <div class="flex gap-2 items-center justify-end">
          <ElButton @click="copyMd(aimd)" class="mt-1">
            <ElIcon>
              <MdiContentCopy />
            </ElIcon>
          </ElButton>
        </div>


      </ElTabPane>

      <!-- setup -->
      <ElTabPane>
        <template #label>
          <TdesignSetting />
        </template>

        <div class="items-center">

          <h2>连接 TiddlyWiki5</h2>
          <el-switch v-model="isCheckTw5" />

          <div>
            <h2>
              端口
            </h2>
            <ElInput v-model.trim.number="port" />
          </div>
          <h2>标签</h2>
          <!-- tag -->
          <div class="flex gap-2">
            <ElTag v-for="tag in dynamicTags" :key="tag" closable :disable-transitions="false" @close="handleClose(tag)">
              {{ tag }}
            </ElTag>
            <ElInput v-if="inputVisible" ref="InputRef" v-model="inputValue" class="w-20" size="small"
              @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />

            <ElButton v-else class="button-new-tag" size="small" @click="showInput"> + </ElButton>
          </div>

          <h2>GROQ API</h2>
          <!-- https://console.groq.com/keys -->

          <div class="flex gap-1">
            <ElInput v-model.trim="GROQ_APIKEY" placeholder="**************" type="password" />
            <ElButton @click="saveGROQAPIKEY">保存</ElButton>
            <el-popconfirm title="你确定要重置API吗 ?" @confirm="resetGROQAPIKEY">
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
          <MaterialSymbolsInfoOutline />
        </template>

        <div class="flex items-center gap-2">
          <ElTag>
            TiddlyWiki5: {{ status.tiddlywiki_version }}
          </ElTag>
          <ElTag type="success">
            Username: {{ status.username }}
          </ElTag>
          <ElTag>
            {{ json.name.toUpperCase() }}: {{ json.version }}
          </ElTag>
          <ElLink href="https://github.com/oeyoews/usewiki2" target="_blank">
            <ElButton>
              <CharmGithub />
            </ElButton>
          </ElLink>
        </div>

      </ElTabPane>

    </ElTabs>

  </div>
</template>
