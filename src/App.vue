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
  watch(mode,()=>Object.assign({}, cells[showIndex.value]))

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
  <div class="flex flex-col items-center">
    <h1 class="text-3xl font-bold mb-8">书法练习</h1>
    <div class="flex gap-1">
      <ImgCellShow
        v-for="(cell, index) of cells"
        :imgUrl="imgUrl"
        :left="cell.left"
        :top="cell.top"
        :width="cell.width"
        :height="cell.height"
        :scale="1"
        @click="showIndex = index" />
    </div>
    {{ startPosition.x }} -
    {{ startPosition.y }}
    <div
      @mousedown="
        (e) => {
          dragging = true;
          startPosition.x = e.clientX;
          startPosition.y = e.clientY;
        }
      ">
      <ImgCellShow
        :imgUrl="imgUrl"
        :left="mainCell.left"
        :top="mainCell.top"
        :width="mainCell.width"
        :height="mainCell.height"
        :scale="8" />
    </div>
    <button class="border" @click="cells.push(Object.assign({}, dragCell))">添加</button>
  </div>
</template>
