<script setup lang="ts">
import { ref } from 'vue'
import Calendar from 'primevue/calendar'

const date = ref(new Date())
const events = ref([
  {
    id: 1,
    title: '项目会议',
    date: new Date(),
    description: '讨论新项目进展'
  }
])
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-3xl font-bold mb-8">事件管理系统</h1>
    
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">选择日期</h2>
      <Calendar v-model="date" :showIcon="true" class="w-full" />
      
      <div class="mt-8">
        <h3 class="text-lg font-semibold mb-4">今日事件</h3>
        <div v-for="event in events" :key="event.id" 
             class="bg-gray-50 p-4 rounded-lg mb-3">
          <h4 class="text-lg font-medium text-blue-600">{{ event.title }}</h4>
          <p class="text-gray-600">{{ event.description }}</p>
          <span class="text-sm text-gray-500">
            {{ event.date.toLocaleTimeString() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>