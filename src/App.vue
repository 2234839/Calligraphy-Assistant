<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import ImgCellShow from "./components/ImgCellShow.vue";
  import imgUrl from "/太上老君说常清静经.webp?url";

  type cell = {
    left: number;
    top: number;
    width: number;
    height: number;
    scale: number;
  };

  const dragging = ref(false);
  const startPosition = reactive({ x: 0, y: 0 });
  const savedCells = localStorage.getItem("cells");
  import 太上老君说常清静经 from "./太上老君说常清静经.json";
  const cells = reactive(太上老君说常清静经 as cell[]);
  console.log(JSON.parse(savedCells ?? "[]"));

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
        <div class="flex justify-center gap-4 mb-6" v-if="0">
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
            class="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200" />
        </div>
        {{ mainCell }}
        <div
          @mousedown="
            (e) => {
              dragging = true;
              startPosition.x = e.clientX;
              startPosition.y = e.clientY;
            }
          "
          class="flex flex-col items-center justify-center mb-6 gap-1">
          <div class="flex">
            <div v-for="i of [1, 2, 3, 4, 5, 6]">
              <ImgCellShow
                v-if="showIndex - i >= 0"
                :imgUrl="imgUrl"
                :left="cells[showIndex - i].left / cells[showIndex - i].scale"
                :top="cells[showIndex - i].top / cells[showIndex - i].scale"
                :width="cells[showIndex - i].width / cells[showIndex - i].scale"
                :height="cells[showIndex - i].height / cells[showIndex - i].scale"
                :scale="1"
                class="cursor-move" />
            </div>
          </div>
          <ImgCellShow
            :imgUrl="imgUrl"
            :left="mainCell.left / mainCell.scale"
            :top="mainCell.top / mainCell.scale"
            :width="mainCell.width / mainCell.scale"
            :height="mainCell.height / mainCell.scale"
            :scale="6"
            class="cursor-move" />
          <div class="flex">
            <div v-for="i of [6, 5, 4, 3, 2, 1]">
              <ImgCellShow
                v-if="showIndex + i < cells.length"
                :imgUrl="imgUrl"
                :left="cells[showIndex + i].left / cells[showIndex + i].scale"
                :top="cells[showIndex + i].top / cells[showIndex + i].scale"
                :width="cells[showIndex + i].width / cells[showIndex + i].scale"
                :height="cells[showIndex + i].height / cells[showIndex + i].scale"
                :scale="1"
                class="cursor-move" />
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            @click="cells.push(Object.assign({}, dragCell))">
            添加
          </button>
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
            @click="showIndex = Math.max(0, showIndex - 1)">
            上一个
          </button>
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
            @click="showIndex = Math.min(cells.length - 1, showIndex + 1)">
            下一个
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
