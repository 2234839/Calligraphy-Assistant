<script setup lang="ts">
  import { ref } from "vue";
  import ImgCellShow from "./components/ImgCellShow.vue";
  import imgUrl from "/test.png?url";
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-3xl font-bold mb-8">书法练习</h1>
    <ImgCellShow :imgUrl="imgUrl" :left="10" :top="50" :width="60" :height="60" :scale="6" />
  </div>
</template>
