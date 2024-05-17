<script setup lang="ts">
import * as WI from '@/utils/icons';
defineProps(['status', 'json']);
</script>

<template>
  <div class="flex gap-2 flex-col">
    <ElTag> TiddlyWiki5: {{ status.tiddlywiki_version }} </ElTag>
    <ElTag> Username: {{ status.username }} </ElTag>
    <ElTag> {{ json.name.toUpperCase() }}: {{ json.version }} </ElTag>
    <ElLink href="https://github.com/oeyoews/usewiki2" target="_blank">
      <WI.CharmGithub />
    </ElLink>
  </div>
</template>
