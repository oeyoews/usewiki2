<script setup lang="ts">
import { unified } from 'unified'
import { ref, } from 'vue';
// @ts-ignore
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkPangu from 'remark-pangu';
// @ts-ignore
import remarkStringify from 'remark-stringify';

// import markdownit from 'markdown-it'

interface IArticle {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
  publishedTime: string;
}

// const mdParser = markdownit()

const html2mdParser = unified()
  .use(rehypeParse)
  .use(remarkGfm)
  .use(rehypeRemark)
  .use(remarkStringify)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(remarkPangu);



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
      const content = await html2mdParser.process(response.content);
      md.value = content.toString()
    })

  })
}

getArticle()

// save a markdown file to user computer


function saveMarkdownFile() {

  const blob = new Blob([md.value], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${article.value.title}.md`

  document.body.appendChild(link);
  link.click();

  URL.revokeObjectURL(link.href);

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

function save2TiddlyWiki() {

}

</script>

<template>
  <div class="app">
    <!-- <div>version 1.0</div> -->
    <div>
      <el-button @click="saveMarkdownFile">保存为 Markdown</el-button>
    </div>
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
  width: 400px;
  height: 450px;
  overflow-y: auto;
}
</style>
