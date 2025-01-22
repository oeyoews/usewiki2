<script setup lang="ts">
import * as WI from '@/utils/icons';
defineProps<{
  status: IStatus;
  json: { name: string; version: string };
}>();
</script>

<template>
  <div class="flex gap-2 flex-wrap justify-center flex-col mt-4">
    <ElTag
      size="large"
      v-show="status.tiddlywiki_version">
      TiddlyWiki5: {{ status.tiddlywiki_version }}
    </ElTag>
    <ElTag
      size="large"
      v-show="status.username">
      Username: {{ status.username }}
    </ElTag>
    <ElTag
      size="large"
      v-show="json">
      {{ json.name }}: {{ json.version }}
    </ElTag>
    <ElLink
      href="https://github.com/oeyoews/usewiki2"
      target="_blank"
      :underline="false"
      class="animate-bounce">
      <WI.CharmGithub />
    </ElLink>
  </div>
</template>
