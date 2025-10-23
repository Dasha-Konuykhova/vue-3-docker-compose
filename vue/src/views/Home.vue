<template>
  <div class="home">
    <h1>🎣 Русская Рыбалка</h1>
    <div class="home-content">
      <LocationSelector :locations="locations" />
      <Inventory :caught-fish="fishingStore.caughtFish" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LocationSelector from '@/components/LocationSelector.vue'
import Inventory from '@/components/Inventory.vue'
import { useFishingStore } from '@/stores/fishing'
import { locations } from '@/data/locations'

const fishingStore = useFishingStore()
</script>

<style scoped lang="less">
@text-color: #333;

.home {
  min-height: 100vh;

  h1 {
    text-align: center;
    margin-bottom: 20px;
    color: @text-color;
  }
}

.home-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 768px) {
  .home-content {
    grid-template-columns: 1fr;
  }
}
</style>