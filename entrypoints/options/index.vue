<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ILocales, MessageSchema } from '@/src/i18n';

const { t } = useI18n<[messages: MessageSchema], ILocales>();
</script>

<template>
  <div
    className="pointer-events-none fixed inset-0 -z-50 size-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
  <div class="prose prose-gray max-w-none">
    <h2>{{ t('common.welcome') }}</h2>
    <div>{{ t('common.comingSoon') }}</div>
  </div>
</template>
