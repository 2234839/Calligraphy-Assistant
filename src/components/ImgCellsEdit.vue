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
            class="absolute border-2 cursor-move"
            :class="{
              'border-red-500': !cell.selected && cell.sourceIndex === -1,
              'border-green-500': cell.selected,
              'border-yellow-500': !cell.selected && cell.sourceIndex !== -1,
            }"
            :style="{
              left: `${cell.left}px`,
              top: `${cell.top}px`,
              width: `${cell.width}px`,
              height: `${cell.height}px`,
            }"
            @mousedown.self="startDragging($event, index)"
            @mouseenter="hoveredCellIndex = index"
            @mouseleave="hoveredCellIndex = -1"
          >
            <div
              class="absolute top-0 right-0 bg-white bg-opacity-75 px-1 rounded z-10 text-xs"
            >
              {{ index + 1 }}
            </div>
            <div
              class="absolute top-0 left-0 w-full h-full"
              @click.stop="toggleCellSelection(index)"
            ></div>
            <div
              v-for="handle in ['nw', 'ne', 'sw', 'se']"
              :key="handle"
              v-show="cell.selected || hoveredCellIndex === index"
              class="absolute w-3 h-3 bg-white border-2 border-gray-500 rounded-full z-20"
              :class="{
                'top-0 left-0 cursor-nw-resize': handle === 'nw',
                'top-0 right-0 cursor-ne-resize': handle === 'ne',
                'bottom-0 left-0 cursor-sw-resize': handle === 'sw',
                'bottom-0 right-0 cursor-se-resize': handle === 'se',
              }"
              @mousedown.stop="startResizing($event, index, handle)"
            ></div>
          </div>
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
        <div class="flex space-x-2">
          <button
            @click="clearCells"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            清除所有选择
          </button>
          <button
            @click="updateCopiedCells"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            :disabled="selectedCellIndex === -1"
          >
            更新复制的Cell
          </button>
          <button @click="deleteSelectedCell" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">删除选中Cell</button>
          <input
            v-model.number="repeatCount"
            type="number"
            min="1"
            class="px-2 py-1 border rounded"
            placeholder="重复次数"
            @input="updateCopiedCells"
          />
          <input
            v-model.number="verticalSpacing"
            type="number"
            class="px-2 py-1 border rounded"
            placeholder="垂直间距"
            @input="updateCopiedCells"
          />
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import imgUrl from "/太上老君说常清静经.webp?url"

  type Cell = {
    left: number;
    top: number;
    width: number;
    height: number;
    scale: number;
    selected: boolean;
    sourceIndex: number;
  };

  type Point = {
    x: number;
    y: number;
  };

  const cells = ref<Cell[]>([]);

  const saveCells = () => {
    localStorage.setItem('cells', JSON.stringify(cells.value));
  };

  const loadCells = () => {
    const savedCells = localStorage.getItem('cells');
    if (savedCells) {
      cells.value = JSON.parse(savedCells);
    }
  };

  const imgRef = ref<HTMLImageElement | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);
  const isSelecting = ref(false);
  const isDragging = ref(false);
  const isResizing = ref(false);
  const selectionStart = ref<Point>({ x: 0, y: 0 });
  const selectionEnd = ref<Point>({ x: 0, y: 0 });
  const repeatCount = ref(1);
  const verticalSpacing = ref(0);
  const dragStartPos = ref<Point>({ x: 0, y: 0 });
  const draggedCellIndex = ref(-1);
  const resizeStartPos = ref<Point>({ x: 0, y: 0 });
  const resizedCellIndex = ref(-1);
  const resizeHandle = ref('');
  const hoveredCellIndex = ref(-1);
  const selectedCellIndex = computed(() => cells.value.findIndex(cell => cell.selected));

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
    if (isDragging.value || isResizing.value) return;
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

    if (width < 5 || height < 5) return;

    const { naturalWidth, width: imgWidth } = imgRef.value;
    const scale = imgWidth / naturalWidth;

    cells.value.push({ left, top, width, height, scale, selected: false, sourceIndex: -1 });
    saveCells();
  };

  const toggleCellSelection = (index: number) => {
    cells.value.forEach((cell, i) => {
      cell.selected = i === index ? !cell.selected : false;
    });
    updateRepeatCountAndSpacing();
    saveCells();
  };

  const startDragging = (e: MouseEvent, index: number) => {
    e.preventDefault();
    isDragging.value = true;
    draggedCellIndex.value = index;
    dragStartPos.value = getMousePosition(e);
    document.addEventListener('mousemove', updateDragging);
    document.addEventListener('mouseup', endDragging);
  };

  const updateDragging = (e: MouseEvent) => {
    if (!isDragging.value) return;
    const currentPos = getMousePosition(e);
    const dx = currentPos.x - dragStartPos.value.x;
    const dy = currentPos.y - dragStartPos.value.y;

    const cell = cells.value[draggedCellIndex.value];
    cell.left += dx;
    cell.top += dy;

    dragStartPos.value = currentPos;
  };

  const endDragging = () => {
    isDragging.value = false;
    draggedCellIndex.value = -1;
    document.removeEventListener('mousemove', updateDragging);
    document.removeEventListener('mouseup', endDragging);
    saveCells();
  };

  const startResizing = (e: MouseEvent, index: number, handle: string) => {
    e.preventDefault();
    isResizing.value = true;
    resizedCellIndex.value = index;
    resizeHandle.value = handle;
    resizeStartPos.value = getMousePosition(e);
    document.addEventListener('mousemove', updateResizing);
    document.addEventListener('mouseup', endResizing);
  };

  const updateResizing = (e: MouseEvent) => {
    if (!isResizing.value) return;
    const currentPos = getMousePosition(e);
    const dx = currentPos.x - resizeStartPos.value.x;
    const dy = currentPos.y - resizeStartPos.value.y;

    const cell = cells.value[resizedCellIndex.value];

    switch (resizeHandle.value) {
      case 'nw':
        cell.left += dx;
        cell.top += dy;
        cell.width -= dx;
        cell.height -= dy;
        break;
      case 'ne':
        cell.top += dy;
        cell.width += dx;
        cell.height -= dy;
        break;
      case 'sw':
        cell.left += dx;
        cell.width -= dx;
        cell.height += dy;
        break;
      case 'se':
        cell.width += dx;
        cell.height += dy;
        break;
    }

    cell.width = Math.max(cell.width, 10);
    cell.height = Math.max(cell.height, 10);

    resizeStartPos.value = currentPos;
  };

  const endResizing = () => {
    isResizing.value = false;
    resizedCellIndex.value = -1;
    resizeHandle.value = '';
    document.removeEventListener('mousemove', updateResizing);
    document.removeEventListener('mouseup', endResizing);
    saveCells();
  };

  const updateCopiedCells = () => {
    const selectedCell = cells.value[selectedCellIndex.value];
    if (!selectedCell) return;

    repeatCount.value = Math.max(1, Math.floor(repeatCount.value));

    const sourceCell = selectedCell.sourceIndex !== -1 ? cells.value[selectedCell.sourceIndex] : selectedCell;
    const sourceIndex = cells.value.indexOf(sourceCell);

    let copiedCells = cells.value.filter(cell => cell.sourceIndex === sourceIndex || cell === sourceCell);
    const currentCount = copiedCells.length;

    if (repeatCount.value > currentCount) {
      for (let i = currentCount; i < repeatCount.value; i++) {
        const newCell = { ...sourceCell, selected: false, sourceIndex: sourceIndex };
        newCell.top = sourceCell.top + (sourceCell.height + verticalSpacing.value) * i;
        cells.value.push(newCell);
      }
    } else if (repeatCount.value < currentCount) {
      cells.value = cells.value.filter(cell =>
        cell.sourceIndex !== sourceIndex ||
        copiedCells.indexOf(cell) < repeatCount.value
      );
    }

    copiedCells = cells.value.filter(cell => cell.sourceIndex === sourceIndex || cell === sourceCell);
    copiedCells.forEach((cell, index) => {
      if (index === 0) {
        cell.sourceIndex = -1;
      } else {
        cell.sourceIndex = sourceIndex;
        cell.top = sourceCell.top + (sourceCell.height + verticalSpacing.value) * index;
      }
    });

    saveCells();
  };

  const clearCells = () => {
    cells.value = [];
    saveCells();
  };

  const updateRepeatCountAndSpacing = () => {
    if (selectedCellIndex.value === -1) return;

    const selectedCell = cells.value[selectedCellIndex.value];
    const sourceCell = selectedCell.sourceIndex !== -1 ? cells.value[selectedCell.sourceIndex] : selectedCell;
    const sourceIndex = cells.value.indexOf(sourceCell);
    const copiedCells = cells.value.filter(cell => cell.sourceIndex === sourceIndex || cell === sourceCell);

    repeatCount.value = copiedCells.length;
    if (copiedCells.length > 1) {
      verticalSpacing.value = copiedCells[1].top - copiedCells[0].top - copiedCells[0].height;
    }
  };

  const deleteSelectedCell = () => {
    const index = cells.value.findIndex(cell => cell.selected);
    if (index === -1) return;

    const selectedCell = cells.value[index];

    if (selectedCell.sourceIndex === -1) {
      const relatedCells = cells.value.filter(cell => cell.sourceIndex === index);
      if (relatedCells.length > 0) {
        const newSourceCell = relatedCells[0];
        newSourceCell.sourceIndex = -1;
        cells.value = cells.value.filter(cell => cell !== selectedCell);
        cells.value.forEach(cell => {
          if (cell.sourceIndex === index) {
            cell.sourceIndex = cells.value.indexOf(newSourceCell);
          } else if (cell.sourceIndex > index) {
            cell.sourceIndex--;
          }
        });
      } else {
        cells.value.splice(index, 1);
        cells.value.forEach(cell => {
          if (cell.sourceIndex > index) {
            cell.sourceIndex--;
          }
        });
      }
    } else {
      cells.value.splice(index, 1);
      cells.value.forEach(cell => {
        if (cell.sourceIndex > index) {
          cell.sourceIndex--;
        }
      });
    }

    saveCells();
  };

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', updateSelection);
    }
    loadCells();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete') {
        deleteSelectedCell();
      }
    });
  });

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', updateSelection);
    }

    document.removeEventListener('keydown', (e) => {
      if (e.key === 'Delete') {
        deleteSelectedCell();
      }
    });
  });

  watch(cells, () => {
    saveCells();
  }, { deep: true });

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