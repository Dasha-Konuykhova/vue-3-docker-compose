<template>
  <div class="home">
    <h1>🎣 Русская Рыбалка</h1>
    <div class="home-content">
      <LocationSelector :locations="locations" />
      <Inventory :caught-fish="caughtFish" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LocationSelector from '@/components/LocationSelector.vue'
import Inventory from '@/components/Inventory.vue'
import { useStore } from 'vuex'
import { computed } from 'vue'
import { locations } from '@/data/locations'

const store = useStore()
const caughtFish = computed(() => store.getters['fishing/caughtFish'])
</script>