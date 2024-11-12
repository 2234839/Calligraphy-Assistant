<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import ImgCellShow from "./components/ImgCellShow.vue";
import imgUrl from "/test.png?url";

type cell = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
};

const dragging = ref(false);
const startPosition = reactive({ x: 0, y: 0 });
const cells = reactive([
  { left: 363.83333333333286, top: 6.500000000000001, width: 50, height: 50, scale: 6 },
  { left: 361.3333333333326, top: 60.66666666666663, width: 50, height: 50, scale: 6 },
  { left: 362.9999999999995, top: 106.33333333333337, width: 50, height: 50, scale: 6 },
  { left: 361.666666666666, top: 154.49999999999991, width: 50, height: 50, scale: 6 },
] as cell[]);
const showIndex = ref(0);

const mode = ref("show" as "show" | "drag");
const dragCell = reactive(Object.assign({}, cells[showIndex.value]));
watch(mode, () => Object.assign({}, cells[showIndex.value]));

const mainCell = computed(() => {
  return cells[showIndex.value];
});

addEventListener("mouseup", () => (dragging.value = false));
addEventListener("mousemove", (e) => {
  if (!dragging.value) return;
  const offsetX = e.clientX - startPosition.x;
  const offsetY = e.clientY - startPosition.y;
  dragCell.left -= offsetX / dragCell.scale;
  dragCell.top -= offsetY / dragCell.scale;
  startPosition.x = e.clientX;
  startPosition.y = e.clientY;
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold text-center text-gray-900 mb-10">书法练习</h1>

      <div class="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div class="flex justify-center gap-4 mb-6">
          <ImgCellShow
            v-for="(cell, index) of cells"
            :key="index"
            :imgUrl="imgUrl"
            :left="cell.left"
            :top="cell.top"
            :width="cell.width"
            :height="cell.height"
            :scale="1"
            @click="showIndex = index"
            class="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div class="text-center text-sm text-gray-600 mb-4">
          坐标: {{ startPosition.x }} - {{ startPosition.y }}
        </div>

        <div
          @mousedown="
            (e) => {
              dragging = true;
              startPosition.x = e.clientX;
              startPosition.y = e.clientY;
            }
          "
          class="flex justify-center mb-6"
        >
          <ImgCellShow
            :imgUrl="imgUrl"
            :left="mainCell.left"
            :top="mainCell.top"
            :width="mainCell.width"
            :height="mainCell.height"
            :scale="8"
            class="cursor-move"
          />
        </div>

        <div class="flex justify-center gap-4">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            @click="cells.push(Object.assign({}, dragCell))"
          >
            添加
          </button>
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
            @click="showIndex = Math.max(0, showIndex - 1)"
          >
            上一个
          </button>
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
            @click="showIndex = Math.min(cells.length - 1, showIndex + 1)"
          >
            下一个
          </button>
        </div>
      </div>
    </div>
  </div>
</template>