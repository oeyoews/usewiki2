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


function togglePreview() {

}


</script>

<template>
  <div class="app">
    <!-- <button @click="getArticle">
      getArticle
    </button>
    <button @click="togglePreview">切换模式</button> -->
    <!-- <textarea auto :value="md" class="textarea"></textarea> -->
    <!-- <p v-html="md"></p> -->
    <button @click="saveMarkdownFile">save markdown</button>
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
      <h2>没有找到文章</h2>
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
