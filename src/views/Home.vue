<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col items-center gap-6">
      <n-upload
        :custom-request="handleUpload"
        accept="image/*"
        :show-file-list="false"
      >
        <n-button>{{ t('upload') }}</n-button>
      </n-upload>

      <div class="flex flex-col gap-4 w-full max-w-md">
        <n-radio-group v-model:value="layout" class="flex justify-center">
          <n-radio-button value="horizontal">{{ t('layout.horizontal') }}</n-radio-button>
          <n-radio-button value="vertical">{{ t('layout.vertical') }}</n-radio-button>
        </n-radio-group>

        <n-radio-group v-model:value="direction" class="flex justify-center">
          <n-radio-button value="ltr">{{ t('layout.ltr') }}</n-radio-button>
          <n-radio-button value="rtl">{{ t('layout.rtl') }}</n-radio-button>
        </n-radio-group>
      </div>

      <div 
        ref="displayContainer"
        class="character-display"
        :class="[layout, direction]"
        @wheel="handleScroll"
      >
        <template v-if="characters.length">
          <div class="context-characters previous">
            <template v-for="(char, idx) in previousChars" :key="'prev-' + idx">
              <span class="context-char">{{ char }}</span>
            </template>
          </div>

          <div class="main-character">{{ characters[currentIndex] }}</div>

          <div class="context-characters next">
            <template v-for="(char, idx) in nextChars" :key="'next-' + idx">
              <span class="context-char">{{ char }}</span>
            </template>
          </div>

          <div class="navigation">
            <n-button @click="previousChar" :disabled="currentIndex === 0">
              {{ t('previous') }}
            </n-button>
            <n-button @click="nextChar" :disabled="currentIndex === characters.length - 1">
              {{ t('next') }}
            </n-button>
          </div>
        </template>
        <n-empty v-else description="Upload an image to start" />
      </div>

      <n-text depth="3" class="scroll-hint">{{ t('scroll') }}</n-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { createWorker } from 'tesseract.js'
import { NUpload, NButton, NRadioGroup, NRadioButton, NEmpty, NText } from 'naive-ui'

const { t } = useI18n()
const layout = ref<'horizontal' | 'vertical'>('horizontal')
const direction = ref<'ltr' | 'rtl'>('ltr')
const characters = ref<string[]>([])
const currentIndex = ref(0)
const displayContainer = ref<HTMLElement | null>(null)

const CONTEXT_CHARS = 3

const previousChars = computed(() => {
  const start = Math.max(0, currentIndex.value - CONTEXT_CHARS)
  return characters.value.slice(start, currentIndex.value)
})

const nextChars = computed(() => {
  const end = Math.min(characters.value.length, currentIndex.value + CONTEXT_CHARS + 1)
  return characters.value.slice(currentIndex.value + 1, end)
})

const handleUpload = async ({ file }: { file: File }) => {
  const worker = await createWorker('chi_sim')
  const { data: { text } } = await worker.recognize(file)
  characters.value = text.split('').filter(char => char.trim())
  currentIndex.value = 0
  await worker.terminate()
}

const nextChar = () => {
  if (currentIndex.value < characters.value.length - 1) {
    currentIndex.value++
  }
}

const previousChar = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const handleScroll = (event: WheelEvent) => {
  if (event.deltaY > 0) {
    nextChar()
  } else {
    previousChar()
  }
}
</script>

<style scoped>
.character-display {
  @apply relative mt-8 p-8 border rounded-lg shadow-lg;
  min-height: 70vh;
  width: 100%;
  max-width: 1000px;
}

.character-display.horizontal {
  @apply flex flex-col items-center;
}

.character-display.horizontal.ltr {
  @apply flex-row;
}

.character-display.horizontal.rtl {
  @apply flex-row-reverse;
}

.character-display.vertical {
  writing-mode: vertical-rl;
}

.character-display.vertical.ltr {
  writing-mode: vertical-lr;
}

.character-display.vertical.rtl {
  writing-mode: vertical-rl;
}

.main-character {
  @apply text-9xl leading-none my-8;
}

.context-characters {
  @apply flex gap-8 text-3xl text-gray-500;
}

.navigation {
  @apply flex gap-4 mt-8 absolute bottom-4 left-1/2 transform -translate-x-1/2;
}

.scroll-hint {
  @apply text-sm text-gray-500 mt-4;
}

.vertical .navigation {
  writing-mode: horizontal-tb;
}
</style>