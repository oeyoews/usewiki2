<script lang="ts" setup>
import * as WI from '@/utils/icons';
defineProps(['aimd', 'aihtml', 'title', 'link', 'faviconUrl']);
</script>

<template>
  <!-- aimd preview -->
  <ElTabPane name="aipreview" v-if="aihtml">
    <template #label>
      <WI.MdiSparklesOutline />
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
      <!-- <el-divider border-style="dashed" /> -->
      <article class="prose prose-gray max-w-none prose-sm dark:prose-invert">
        <div v-html="aihtml"></div>
      </article>
    </div>
  </ElTabPane>
</template>
