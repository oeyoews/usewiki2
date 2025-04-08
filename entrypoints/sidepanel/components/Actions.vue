<script setup lang="ts">
import * as WI from '@/utils/icons';
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

function defineAction<T extends string>(actions: Array<IAction<T>>) {
  return actions;
}

const actions = defineAction([
  {
    name: '日记',
    icon: WI.PhPencil,
    command: 'journal',
    condition: props.isCheckTw5,
  },
  {
    name: '编辑',
    icon: WI.CharmBookOpen,
    command: 'edit',
  },
  {
    name: '详情',
    icon: WI.MaterialSymbolsInfoOutline,
    command: 'info',
  },
  {
    name: '太微',
    icon: WI.SimpleIconsTiddlywiki,
    command: 'tiddlywiki',
  },
  {
    name: '配置',
    icon: WI.LetsIconsSettingAltLine,
    command: 'setup',
  },
  {
    name: '下载',
    icon: WI.MaterialSymbolsDownload,
    command: 'download',
    divided: true,
  },
  {
    name: '复制',
    icon: WI.ZondiconsCopy,
    command: 'copy',
  },
  {
    name: '切换',
    icon: WI.FluentDarkTheme24Filled,
    command: 'darkmode',
  },
  {
    name: '刷新',
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
      <WI.SimpleIconsTiddlywiki class="mr-2" />
      同步到太微
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
