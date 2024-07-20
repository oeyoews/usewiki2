<script setup lang="ts">
import * as WI from '@/utils/icons';
interface IProps {
  command: any;
  /** check tw5 */
  isCheckTw5: boolean;
  defaultCommand: any;
}
defineProps<IProps>();
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
      保存
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :icon="WI.PhPencil"
          command="journal"
          v-if="isCheckTw5"
          >日记
        </el-dropdown-item>
        <el-dropdown-item
          :icon="WI.MaterialSymbolsInfoOutline"
          command="info">
          详情</el-dropdown-item
        >
        <el-dropdown-item
          :icon="WI.LetsIconsSettingAltLine"
          command="setup">
          配置</el-dropdown-item
        >
        <el-dropdown-item
          :icon="WI.ZondiconsCopy"
          command="copy"
          >复制
        </el-dropdown-item>
        <el-dropdown-item
          divided
          :icon="WI.MaterialSymbolsDownload"
          command="download"
          >下载
        </el-dropdown-item>
        <el-dropdown-item
          :icon="WI.MdiCloudRefreshVariant"
          command="refresh"
          >刷新
        </el-dropdown-item>
        <el-dropdown-item
          :icon="WI.FluentDarkTheme24Filled"
          command="darkmode"
          >切换
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
