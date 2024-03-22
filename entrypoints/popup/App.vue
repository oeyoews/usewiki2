<script setup lang="ts">
import { ref, onMounted } from 'vue';

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

const article = ref<Partial<IArticle>>({
  title: '',
  content: '',
  excerpt: ''
})

chrome.storage.local.get(['article'], function (result) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError, '[ERROE]');
    return;
  }
  if (result) {
    article.value = result.article
  }
});

</script>

<template>
  <div class="app">
    <div v-if="article.title">
      <h2> {{ article.title }}</h2>
      <hr>
      <div v-html="article.excerpt"></div>
      <hr>
      <div v-html="article.content"></div>
    </div>
    <div v-else>
      <h2>没有找到文章</h2>
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 400px;
  height: 250px;
  overflow-y: auto;
}
</style>
