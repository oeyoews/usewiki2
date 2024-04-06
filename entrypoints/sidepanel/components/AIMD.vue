<script setup lang="ts">
import * as WI from '@/utils/icons';
defineProps(['aimd']);
</script>

<template>
  <!-- AI edit MD -->
  <ElTabPane v-if="aimd" name="aiedit">
    <template #label>
      <WI.StreamlineAiEditSparkSolid />
    </template>
    <el-input
      v-model="aimd"
      :autosize="{ minRows: 4, maxRows: 20 }"
      type="textarea"
      spellcheck="false"
      class="w-full"
      resize="none" />
    <div class="flex gap-2 items-center justify-end">
      <ElButton @click="copyMd(aimd)" class="mt-1" size="default">
        <WI.MdiContentCopy />
      </ElButton>
    </div>
  </ElTabPane>
</template>
