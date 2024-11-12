<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";

  interface Props {
    imgUrl: string;
    left: number;
    top: number;
    width: number;
    height: number;
    scale: number;
  }

  const props = defineProps<Props>();

  const originalWidth = ref(0);
  const originalHeight = ref(0);

  const scaledBackgroundSize = computed(() => {
    return `${originalWidth.value * props.scale}px ${originalHeight.value * props.scale}px`;
  });

  const backgroundPosition = computed(() => {
    return `-${props.left * props.scale}px -${props.top * props.scale}px`;
  });

  onMounted(() => {
    const img = new Image();
    img.onload = () => {
      originalWidth.value = img.width;
      originalHeight.value = img.height;
    };
    img.src = props.imgUrl;
  });
</script>

<template>
  <div
    class="image-cropper"
    :style="{
      backgroundImage: `url(${imgUrl})`,
      backgroundPosition: backgroundPosition,
      backgroundSize: scaledBackgroundSize,
      width: `${width * props.scale}px`,
      height: `${height * props.scale}px`,
    }"></div>
</template>

<style scoped>
  .image-cropper {
    background-repeat: no-repeat;
    overflow: hidden;
  }
</style>
