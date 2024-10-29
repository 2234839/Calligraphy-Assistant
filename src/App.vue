<template>
  <n-config-provider :locale="locale" :date-locale="dateLocale" :theme="theme">
    <n-layout>
      <n-layout-header class="header">
        <nav>
          <n-select v-model:value="currentLang" :options="languageOptions" />
        </nav>
      </n-layout-header>
      <n-layout-content>
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NConfigProvider, NLayout, NLayoutHeader, NLayoutContent, NSelect } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { darkTheme } from 'naive-ui'

const theme = ref(null)
const { locale } = useI18n()
const currentLang = ref('zh-CN')

const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]
</script>

<style>
.header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
</style>