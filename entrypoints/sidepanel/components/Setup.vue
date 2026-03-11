<!-- deprecated -->
<script lang="ts" setup>
import * as WI from '@/utils/icons';
import { useI18n } from 'vue-i18n';
import type { ILocales, MessageSchema } from '@/src/i18n';

const { t } = useI18n<[messages: MessageSchema], ILocales>();

const props = defineProps([
  'isCheckTw5',
  'port',
  'dynamicTags',
  'inputVisible',
  'inputValue',
]);

const emit = defineEmits([
  'savePort',
  'handleClose',
  'handleInputConfirm',
  'showInput',
]);
const savePort = (port: number) => emit('savePort', port);
const handleClose = (tag: string) => emit('handleClose', tag);
const handleInputConfirm = () => emit('handleInputConfirm');
const showInput = () => emit('showInput');
</script>

<template>
  <ElTabPane>
    <template #label>
      <WI.TdesignSetting />
      <span class="ml-1">{{ t('actions.settings') }}</span>
    </template>

    <div class="items-center">
      <h2>{{ t('setup.connectToTW5') }}</h2>
      <el-switch
        v-model="isCheckTw5"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />

      <div>
        <h2>{{ t('setup.tw5Port') }}</h2>
        <div class="flex gap-2">
          <ElInput v-model.trim.number="port" />
          <ElButton @click="savePort(port!)">{{ t('setup.save') }}</ElButton>
        </div>
      </div>
      <h2>{{ t('setup.clippingTags') }}</h2>
      <!-- tag -->
      <div class="flex gap-2">
        <ElTag
          v-for="tag in dynamicTags"
          :key="tag"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)">
          {{ tag }}
        </ElTag>
        <ElInput
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          class="w-20"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm" />

        <ElButton
          v-else
          class="button-new-tag"
          size="small"
          @click="showInput">
          +
        </ElButton>
      </div>

      <!-- https://console.groq.com/keys -->
      <!-- <div class="hidden">
        <h2>GROQ API</h2>
        <div class="flex gap-1">
          <ElInput
            v-model.trim="GROQ_APIKEY"
            placeholder="**************"
            type="password" />
          <ElButton @click="utils.saveGROQAPIKEY(GROQ_APIKEY)">{{ t('setup.save') }}</ElButton>

          <el-popconfirm
            :title="t('setup.resetApiConfirm')"
            @confirm="utils.resetGROQAPIKEY">
            <template #reference>
              <ElButton>{{ t('setup.reset') }}</ElButton>
            </template>
          </el-popconfirm>
        </div>
      </div> -->
    </div>
  </ElTabPane>
</template>
