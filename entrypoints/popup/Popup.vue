<script setup lang="ts">
import 'element-plus/es/components/message/style/css'

// @ts-ignore
import FaRegularEdit from '~icons/fa-regular/edit';
// @ts-ignore
import FaFileTextO from '~icons/fa/file-text-o';
// @ts-ignore
import FaRegularSave from '~icons/fa-regular/save';
import { ElMessage, ElNotification } from 'element-plus'
import { ref, } from 'vue';
import saveMarkdown from '@/utils/saveMarkdown'
import { html2md, md2html } from '@/utils/parser'

const html = ref('')
const md = ref('')
const link = ref('')
const faviconUrl = ref('')
const title = ref('')

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

</script>

<template>
  <div class="app">
    <!-- version -->
    <div class="sticky top-0 backdrop-blur-sm mb-2">
      <div class="flex justify-end">

        <ElBacktop :right="100" :bottom="100" />
        <ElButton @click="saveMarkdown(md, title!)">
          <ElIcon>
            <FaRegularSave />
          </ElIcon>
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
          <hr>
          <article class="prose prose-gray max-w-none prose-sm dark:prose-invert">
            <div v-html="html"></div>
          </article>
        </div>
        <!-- <div v-else>
          <h2>暂无内容</h2>
        </div> -->
      </ElTabPane>

      <ElTabPane>
        <template #label>
          <FaRegularEdit />
        </template>

        <el-input type="text" v-model="title" class="mb-1" />
        <el-input placeholder="写点什么吧 ..." v-model="md" :autosize="{ minRows: 4, maxRows: 20 }" type="textarea"
          spellcheck="false" class="w-full" />
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
