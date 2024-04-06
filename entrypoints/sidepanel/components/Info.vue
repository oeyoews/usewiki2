<script setup lang="ts">
import * as WI from '@/utils/icons';
defineProps(['status', 'json']);
</script>

<template>
  <ElTabPane v-if="status.tiddlywiki_version">
    <template #label>
      <WI.MaterialSymbolsInfoOutline />
    </template>

    <div class="flex items-center gap-2 flex-wrap">
      <ElTag> TiddlyWiki5: {{ status.tiddlywiki_version }} </ElTag>
      <ElTag type="success"> Username: {{ status.username }} </ElTag>
      <ElTag> {{ json.name.toUpperCase() }}: {{ json.version }} </ElTag>
      <ElLink href="https://github.com/oeyoews/usewiki2" target="_blank">
        <ElButton>
          <WI.CharmGithub />
        </ElButton>
      </ElLink>
    </div>
  </ElTabPane>
</template>
