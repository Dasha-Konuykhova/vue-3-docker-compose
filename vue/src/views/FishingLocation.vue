<template>
  <div class="fishing-location">
    <div class="location-header">
      <button class="back-button" @click="$router.push('/')">
        ← Назад к выбору
      </button>
      <h1>{{ location.name }}</h1>
    </div>

    <FishingArea
      :location="location"
      @catch-fish="handleCatchFish"
    />
  </div>
</template>

<script setup lang="ts">
import FishingArea from '../components/FishingArea.vue'
import { computed } from 'vue'
import { useFishingStore } from '@/stores/fishing'
import type { Location, Fish, CaughtFish } from '@/types'

const props = defineProps<{
  id: string | number
}>()

const fishingStore = useFishingStore()

const location = computed((): Location => {
  const loc = fishingStore.getLocationById(parseInt(String(props.id)))
  return loc || fishingStore.getLocationById(1)!
})

const handleCatchFish = (fishData: Fish & { location: string }) => {
  console.log('FishingLocation: Рыба поймана', fishData)

  const caughtFish: CaughtFish = {
    ...fishData,
    timestamp: new Date().toLocaleTimeString()
  }

  console.log('FishingLocation: Вызываем addFish', caughtFish)
  fishingStore.addFish(caughtFish)
}
</script>

<style scoped lang="less">
@button-bg: #6c757d;
@button-hover-bg: #5a6268;
@text-color: #333;
@border-color: #ddd;

.fishing-location {
  min-height: 100vh;

  .location-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid @border-color;

    .back-button {
      background: @button-bg;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background: @button-hover-bg;
      }
    }

    h1 {
      color: @text-color;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .fishing-location {
    .location-header {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }
}
</style>