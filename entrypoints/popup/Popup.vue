<script setup lang="ts">
import 'element-plus/es/components/message/style/css'
import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc"

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
import { ref, } from 'vue';
import saveMarkdown from '@/utils/saveMarkdown'
import { html2md, md2html } from '@/utils/parser'
dayjs.extend(utc)

const html = ref('')
const md = ref('')
const link = ref('')
const faviconUrl = ref('')
const title = ref('')
const username = ref('oeyoews')

const inputValue = ref()

const dynamicTags = ref()

chrome.storage.local.get(['tags'], function (result) {
  if (result.tags) {
    dynamicTags.value = Object.values(result.tags)
  } else {
    dynamicTags.value = ['剪藏']
  }
});

const inputVisible = ref(false)
const InputRef = ref()


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

const port = ref('')

chrome.storage.local.get(['port'], function (result) {
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

function checkStatus() {

  fetch(`http://localhost:${port.value}/status`).then((res) => {
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
      // ElMessage({
      //   message: 'TiddlyWiki 连接成功',
      //   type: 'success'
      // })
    }
  }).catch((e) => {
    ElMessage({
      message: "TiddlyWiki 未成功连接" + e,
      type: 'error'
    })
  })

}

watch(md, async () => {
  html.value = (await md2html(md.value))
})

watch(port, () => {
  chrome.storage.local.set({ port: port.value })
  checkStatus()
})

const currentTime = dayjs(new Date()).utc().format('YYYYMMDDHHmmss')
const save2TiddlyWiki = async (title: string, text: string, port: string, url: string, tag: string[]) => {
  const tags = tag.map(function (tag) {
    if (tag.includes(' ')) {
      return '[[' + tag + ']]';
    } else {
      return tag;
    }
  }).join(' ');

  if (!status.value.tiddlywiki_version) {
    ElMessage({
      message: '请先连接 TiddlyWiki',
      type: 'error'
    })
    return
  }

  fetch(`http://localhost:${port}/recipes/default/tiddlers/${title}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "x-requested-with": "TiddlyWiki"
    },
    body: JSON.stringify({
      text, creator: username.value,
      type: 'text/markdown',
      url,
      created: currentTime,
      modified: currentTime,
      tags
    })
  }).then((res) => {
    if (res.ok) {
      ElMessage({
        message: '保存成功',
        type: 'success'
      })
    }
  }).catch((e) => {
    ElMessage({
      message: '保存失败' + e,
      type: 'error'
    })
  })
}

</script>

<template>
  <div class="app">
    <!-- version -->
    <div class="sticky top-0 backdrop-blur-sm mb-2">
      <div class="flex justify-end">

        <!-- <ElBacktop :right="100" :bottom="100" /> -->
        <ElButton @click="saveMarkdown(md, title!)">
          <ElIcon>
            <MaterialSymbolsDownload />
          </ElIcon>
        </ElButton>

        <ElButton @click="save2TiddlyWiki(title, md, port, link, dynamicTags)">
          <FaRegularSave />
        </ElButton>
      </div>
    </div>
    <ElTabs type="border-card">

      <ElTabPane>
        <template #label>
          <ElIcon>
            <FaFileTextO />
          </ElIcon>
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
          <article class="prose prose-gray max-w-none prose-sm dark:prose-invert">
            <div v-html="html"></div>
          </article>
        </div>
      </ElTabPane>

      <!-- edit -->
      <ElTabPane>
        <template #label>
          <FaRegularEdit />
        </template>

        <el-input type="text" v-model="title" class="mb-1" />
        <el-input placeholder="写点什么吧 ..." v-model="md" :autosize="{ minRows: 4, maxRows: 20 }" type="textarea"
          spellcheck="false" class="w-full" />
      </ElTabPane>

      <!-- setup -->
      <ElTabPane>
        <template #label>
          <TdesignSetting />
        </template>

        <div class="items-center">
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
        </div>


      </ElTabPane>

      <!-- info -->
      <ElTabPane v-if="status.tiddlywiki_version">
        <template #label>
          <MaterialSymbolsInfoOutline />
        </template>

        Username:
        <ElButton>
          {{ status.username }}
        </ElButton>
        TiddlyWiki:
        <ElButton>
          {{ status.tiddlywiki_version }}
        </ElButton>
      </ElTabPane>


    </ElTabs>

  </div>
</template>

<style scoped>
.textarea {
  border-radius: 4px;
  resize: none;
  width: 100%;
  height: 400px;
}

.app {
  width: 600px;
  height: 550px;
  overflow-y: auto;
}
</style>
