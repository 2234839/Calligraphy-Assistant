<template>
  <div class="relative">
    <div class="overflow-x-auto overflow-y-auto max-h-[80vh]" ref="containerRef">
      <div class="relative inline-block" style="width: 800rem;">
        <img
          :src="imgUrl"
          ref="imgRef"
          @load="onImageLoad"
          @mousedown="startSelection"
          class="w-full cursor-crosshair"
          style="user-select: none;"
          draggable="false"
        />
        <div
          v-for="(cell, index) in cells"
          :key="index"
          class="absolute border-2 border-red-500 cursor-pointer"
          :style="{
            left: `${cell.left}px`,
            top: `${cell.top}px`,
            width: `${cell.width}px`,
            height: `${cell.height}px`,
          }"
          @click="deleteCell(index)"
        ></div>
        <div
          v-if="isSelecting"
          class="absolute border-2 border-blue-500 pointer-events-none"
          :style="{
            left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
            top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
            width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
            height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
          }"
        ></div>
      </div>
    </div>
    <div class="mt-4 space-y-2">
      <button
        @click="clearCells"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        清除所有选择
      </button>
      <div class="bg-gray-100 p-4 rounded overflow-x-auto">
        <pre>{{ JSON.stringify(cells, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import imgUrl from "/太上老君说常清静经.webp?url"

type Cell = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
};

type Point = {
  x: number;
  y: number;
};

const cells = ref<Cell[]>([]);
const imgRef = ref<HTMLImageElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const isSelecting = ref(false);
const selectionStart = ref<Point>({ x: 0, y: 0 });
const selectionEnd = ref<Point>({ x: 0, y: 0 });

const onImageLoad = () => {
  if (imgRef.value) {
    const { naturalWidth, width } = imgRef.value;
    const scale = width / naturalWidth;
    cells.value.forEach(cell => {
      cell.scale = scale;
    });
  }
};

const getMousePosition = (e: MouseEvent): Point => {
  if (!imgRef.value || !containerRef.value) return { x: 0, y: 0 };

  const containerRect = containerRef.value.getBoundingClientRect();
  const imgRect = imgRef.value.getBoundingClientRect();

  const scrollLeft = containerRef.value.scrollLeft;
  const scrollTop = containerRef.value.scrollTop;

  const x = e.clientX + scrollLeft - containerRect.left;
  const y = e.clientY + scrollTop - containerRect.top;

  return { x, y };
};

const startSelection = (e: MouseEvent) => {
  const pos = getMousePosition(e);
  selectionStart.value = pos;
  selectionEnd.value = pos;
  isSelecting.value = true;
  document.addEventListener('mousemove', updateSelection);
  document.addEventListener('mouseup', endSelection);
};

const updateSelection = (e: MouseEvent) => {
  if (!isSelecting.value) return;
  selectionEnd.value = getMousePosition(e);
};

const endSelection = () => {
  isSelecting.value = false;
  document.removeEventListener('mousemove', updateSelection);
  document.removeEventListener('mouseup', endSelection);

  if (!imgRef.value) return;

  const left = Math.min(selectionStart.value.x, selectionEnd.value.x);
  const top = Math.min(selectionStart.value.y, selectionEnd.value.y);
  const width = Math.abs(selectionEnd.value.x - selectionStart.value.x);
  const height = Math.abs(selectionEnd.value.y - selectionStart.value.y);

  if (width < 5 || height < 5) return; // Ignore very small selections

  const { naturalWidth, width: imgWidth } = imgRef.value;
  const scale = imgWidth / naturalWidth;

  cells.value.push({ left, top, width, height, scale });
};

const deleteCell = (index: number) => {
  cells.value.splice(index, 1);
};

const clearCells = () => {
  cells.value = [];
};

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', updateSelection);
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', updateSelection);
  }
  document.removeEventListener('mousemove', updateSelection);
  document.removeEventListener('mouseup', endSelection);
});
</script>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  max-width: 100vw;
}
.overflow-y-auto {
  overflow-y: auto;
}
</style>