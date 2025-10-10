<template>
  <div class="home">
    <h1>🎣 Русская Рыбалка</h1>
    <div class="home-content">
      <LocationSelector :locations="locations" />
      <Inventory :caught-fish="caughtFish" />
    </div>
  </div>
</template>

<script>
import LocationSelector from '@/components/LocationSelector.vue'
import Inventory from '@/components/Inventory.vue'
import { locations } from '@/data/locations'

export default {
  name: 'Home',
  components: {
    LocationSelector,
    Inventory
  },
  inject: ['caughtFish'],
  data() {
    return {
      locations: locations
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.home h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
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