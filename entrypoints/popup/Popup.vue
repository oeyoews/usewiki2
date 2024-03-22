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
import { html2md, md2html } from '@/composables/parser';


const article = ref<Partial<IArticle>>({
  title: '',
  content: '',
  excerpt: ''
})

const md = ref('')
const link = ref('')
const faviconUrl = ref('')

function getArticle() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0]
    link.value = tab.url!;
    faviconUrl.value = tab.favIconUrl!
    // @ts-ignore
    chrome.tabs.sendMessage(tab.id, '', async function (response) {
      article.value = response
      const content = await html2md(response.content);
      md.value = content.toString()
    })

  })
}

getArticle()

// watch(md, () => {
//   ElMessage({
//     message: '修改成功'
//   })
//   article.value.content = md.value
// })


function saveMarkdownFile() {

  const blob = new Blob([md.value], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${article.value.title}.md`

  document.body.appendChild(link);
  link.click();


  URL.revokeObjectURL(link.href);

  ElMessage({
    message: '保存成功',
    type: 'success'
  })

}

function saveMarkdownFile2() {
  // 创建一个 Blob 对象，包含新的 Markdown 内容
  const blob = new Blob([md.value], { type: 'text/markdown' });

  async function saveFile(blob: Blob) {
    try {
      const options = {
        suggestedName: article.value.title + '.md',// 设置默认文件名
        types: [
          {
            description: 'Markdown 文件 (.md)',
            accept: {
              'text/markdown': ['.md']
            }
          }
        ]
      };
      // @ts-ignore
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('文件已保存');
    } catch (err) {
      console.error('保存文件时出错：', err);
    }
  }

  // 调用 saveFile 函数并传入 Blob 对象
  saveFile(blob);

}

// function save2TiddlyWiki() { }

</script>

<template>
  <div class="app">
    <!-- version -->
    <div class="fixedright0 top2 sticky top-0">
      <div class="flex justify-end">
        <ElButton>
          Home
        </ElButton>
        <el-button @click="saveMarkdownFile">
          <el-icon>
            <FaRegularSave />
          </el-icon>
        </el-button>
      </div>
    </div>
    <el-tabs type="border-card">

      <el-tab-pane>
        <template #label>
          <FaRegularEdit />
        </template>

        <el-input placeholder="写点什么吧 ..." v-model="md" :autosize="{ minRows: 4, maxRows: 20 }" type="textarea"
          spellcheck="false" class="w-full" />
      </el-tab-pane>

      <el-tab-pane>
        <template #label>
          <el-icon>
            <FaFileTextO />
          </el-icon>
        </template>
        <div v-if="article.title">
          <div class="flex items-center justify-center gap-2">
            <h2>
              <a :href="link" target="_blank" v-if="link">
                <img :src="faviconUrl" class="rounded-full size-4" />
              </a>
              {{ article.title }}
            </h2>
          </div>
          <hr>
          <article class="prose prose-gray max-w-none prose-sm dark:prose-invert">
            <h2>摘要</h2>
            <div v-html="article.excerpt"></div>
            <h2>内容</h2>
            <div v-html="article.content"></div>
          </article>
        </div>
        <div v-else>
          <h2>暂无内容</h2>
        </div>
      </el-tab-pane>


    </el-tabs>

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
