<!-- history -->
<script setup lang="ts">
import {
  MaterialSymbolsHouseOutlineRounded,
  MaterialSymbolsSearchRounded,
  LogosChrome,
  LogosBing,
} from '@/utils/icons';
const props = defineProps<{
  port: number;
}>();
// defineEmits(['goHome']);
// const isHome = defineModel<boolean>('isHome', {
//   required: true,
//   default: false,
//   type: Boolean,
// });
const isHome = defineModel('isHome');
// const url = computed(() => `http://localhost:${props.port.toString()}`);
// const url = watch(() => `http://localhost:${props.port.toString()}`);
const link = ref(`http://localhost:${props.port.toString()}`);
// defineExpose({
//   link,
//   demo: 99,
// });
const targetLink = ref(link.value);
const engines = [
  {
    name: 'Google',
    value: 'https://www.google.com/search?q=',
    icon: LogosChrome,
  },
  {
    name: 'Bing',
    value: 'https://www.bing.com/search?q=',
    icon: LogosBing,
  },
] as const;

const getCurrentIcon = (value: string) => {
  return engines.find((engine) => engine.value === value)?.icon;
};

const searchEngine = ref(engines[0].value);
const openweb = (url: string) => {
  if (!url.startsWith('http')) {
    link.value = searchEngine.value + encodeURIComponent(url) + '&sidesearch=1';
  } else {
    link.value = url;
  }
};

const goHome = () => {
  isHome.value = !isHome.value;
  console.log('go home', isHome.value);
};
</script>

<template>
  <div class="m-2 not-prose">
    <el-form
      size="default"
      id="iframe-form">
      <el-form-item label="">
        <div class="flex w-full">
          <!-- @click="$emit('goHome')" -->
          <el-button
            @click="goHome"
            size="small"
            class="!mr-1 aspect-square">
            <material-symbols-house-outline-rounded />
          </el-button>
          <el-input
            v-model="targetLink"
            placeholder="TiddlyWiki5"
            class="mr-1"
            :suffix-icon="MaterialSymbolsSearchRounded"
            @keyup.enter="openweb(targetLink)">
            <template #prepend>
              <el-select
                v-model="searchEngine"
                placeholder="搜索引擎"
                style="width: 60px">
                <template #prefix>
                  <component :is="getCurrentIcon(searchEngine)" />
                </template>
                <el-option
                  v-for="engine in engines"
                  :key="engine.name"
                  :label="engine.name"
                  :value="engine.value">
                  <div class="flex items-center gap-2">
                    <component :is="engine.icon" />
                    {{ engine.name }}
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-input>
        </div>
      </el-form-item>
    </el-form>
    <!-- src="https://blog.oeyoews.top" -->
    <!-- openweb("https://www.google.com/search?q=" + encodeURIComponent(query) + "&sidesearch=1", true); -->
    <!-- https://stackoverflow.com/questions/15532791/getting-around-x-frame-options-deny-in-a-chrome-extension/69177790#69177790 -->
    <!-- pagesidebar chrome extension -->
    <iframe
      class="h-[calc(100vh-60px)] w-full rounded-lg"
      :src="link"
      allow="camera; clipboard-write; fullscreen; microphone; geolocation"
      allowfullscreen
      frameborder="0"></iframe>
  </div>
</template>

<style scoped lang="css">
/* #search-input ::v-deep(.el-input__wrapper) { */
/* border-radius: 59px !important; */
/* } */
#iframe-form ::v-deep(.el-form-item) {
  margin-bottom: 8px;
}
</style>
