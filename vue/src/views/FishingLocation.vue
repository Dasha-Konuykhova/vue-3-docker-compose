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

<script>
import FishingArea from '@/components/FishingArea.vue'
import { locations } from '@/data/locations'

export default {
  name: 'FishingLocation',
  components: {
    FishingArea
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  inject: ['addFish'],
  data() {
    return {
      locations: locations
    }
  },
  computed: {
    location() {
      return this.locations.find(loc => loc.id === parseInt(this.id)) || this.locations[0]
    }
  },
  methods: {
    handleCatchFish(fishData) {
      console.log('FishingLocation: Рыба поймана', fishData)

      const caughtFish = {
        ...fishData,
        timestamp: new Date().toLocaleTimeString()
      }

      console.log('FishingLocation: Вызываем addFish', caughtFish)
      this.addFish(caughtFish)
    }
  }
}
</script>

<style scoped>
.fishing-location {
  min-height: 100vh;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.back-button {
  background: #6c757d;
  color: white;
  border: none;
}

.back-button:hover {
  background: #5a6268;
}

.location-header h1 {
  color: #333;
  margin: 0;
}

@media (max-width: 768px) {
  .location-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>