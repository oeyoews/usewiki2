<script setup lang="ts">
import { storage } from 'wxt/storage';
import HelloWorld from '@/components/HelloWorld.vue';
import { ref, onMounted } from 'vue';
// var article = new Readability(document).parse();

const htmlContent = ref<{
  title: string,
  content: string
  excerpt: string
}>({
  title: '',
  content: '',
  excerpt: ''
})

// 在弹出窗口的脚本中接收来自内容脚本的消息
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  console.log('收到来自 ' + sender.tab?.url + ' 的消息：')
  await storage.setItem('local:data', message)
  const data = await storage.getItem('local:data')
  console.log(data)
  // 在这里处理收到的消息
});

async function getHtmlContent() {
  const data = await storage.getItem('local:data')
  htmlContent.value = data
  console.log(data)
}

getHtmlContent()

</script>

<template>
  <div class="app">
    <h2> {{ htmlContent.title }}</h2>
    <div v-html="htmlContent.content"></div>
    <div v-html="htmlContent.excerpt"></div>
  </div>
</template>

<style scoped>
.app {
  width: 400px;
  height: 250px;
}
</style>
