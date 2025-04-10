<script setup lang="ts">
import * as WI from '@/utils/icons';
import { useI18n } from 'vue-i18n';

import type { FunctionalComponent } from 'vue';
interface IProps {
  command: any;
  /** check tw5 */
  isCheckTw5: boolean;
  defaultCommand: any;
}
const props = defineProps<IProps>();

type IAction<T> = {
  name: string;
  icon: FunctionalComponent;
  command: T;
  divided?: boolean;
  condition?: boolean;
};
import type { ILocales, MessageSchema } from '@/src/i18n';

const { t } = useI18n<[messages: MessageSchema], ILocales>();

function defineAction<T extends string>(actions: Array<IAction<T>>) {
  return actions;
}

const actions = defineAction([
  {
    name: t('actions.journal'),
    icon: WI.PhPencil,
    command: 'journal',
    condition: props.isCheckTw5,
  },
  {
    name: t('actions.edit'),
    icon: WI.CharmBookOpen,
    command: 'edit',
  },
  {
    name: t('actions.info'),
    icon: WI.MaterialSymbolsInfoOutline,
    command: 'info',
  },
  {
    name: t('actions.tiddlywiki'),
    icon: WI.SimpleIconsTiddlywiki,
    command: 'tiddlywiki',
  },
  {
    name: t('actions.settings'),
    icon: WI.LetsIconsSettingAltLine,
    command: 'setup',
  },
  {
    name: t('actions.download'),
    icon: WI.MaterialSymbolsDownload,
    command: 'download',
    divided: true,
  },
  {
    name: t('actions.copy'),
    icon: WI.ZondiconsCopy,
    command: 'copy',
  },
  {
    name: t('actions.darkmode'),
    icon: WI.FluentDarkTheme24Filled,
    command: 'darkmode',
  },
  {
    name: t('actions.refresh'),
    icon: WI.MdiCloudRefreshVariant,
    command: 'refresh',
  },
]);

export type ICommand = (typeof actions)[number]['command'];
</script>

<template>
  <el-dropdown
    size="default"
    split-button
    placement="bottom-start"
    trigger="hover"
    @command="command"
    @click="defaultCommand"
    type="primary">
    <span class="el-dropdown-link flex items-center">
      <WI.SimpleIconsTiddlywiki class="mr-0.5" />
      {{ t('actions.sync') }}
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="action in actions"
          :command="action.command"
          :divided="action.divided"
          :icon="action.icon"
          :v-if="action.condition ? action.condition : true"
          :key="action.name">
          {{ action.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scope>
.el-button-group {
  display: flex;
}
</style>
