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
import { ElMessage } from 'element-plus';
dayjs.extend(utc)

const html = ref('')
const md = ref('')
const link = ref('')
const faviconUrl = ref('')
const title = ref('')
const username = ref('oeyoews')
const port = ref('8000')

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0]
  link.value = tab.url!;
  faviconUrl.value = tab.favIconUrl!
  // @ts-ignore
  chrome.tabs.sendMessage(tab.id, '', async function (response: IArticle) {
    html.value = response.content
    md.value = await html2md(html.value);
    title.value = response.title
  })

})


watch(md, async () => {
  html.value = (await md2html(md.value))
})

const status = ref<{
  username: string, tiddlywiki_version: string
}>({
  username: '',
  tiddlywiki_version: ''
})

fetch(`http://localhost:${port.value}/status`).then((res) => {
  return res.json()
}).then((data) => {
  status.value = data;
  if (!data.tiddlywiki_version) {
    ElMessage({
      message: 'TiddlyWiki 未连接',
      type: 'error'
    })
  }
})


const save2TiddlyWiki = async (title: string, text: string, port: string) => {
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
      created: dayjs(new Date()).utc().format('YYYYMMDDHHmmss')
    })
  }).then((res) => {
    if (res.ok) {
      ElMessage({
        message: '保存成功',
        type: 'success'
      })
    }
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

        <ElButton @click="save2TiddlyWiki(title, md, port)">
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

        <div class="flex items-center">
          <div>
            端口
          </div>
          <ElInput v-model="port" />
        </div>


      </ElTabPane>

      <!-- info -->
      <ElTabPane>
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
