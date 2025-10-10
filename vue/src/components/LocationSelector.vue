<template>
  <div class="location-selector">
    <h2>🌊 Выберите водоем</h2>
    <div class="locations-list">
      <div
        v-for="location in locations"
        :key="location.id"
        class="location-card"
        @click="goToLocation(location)"
      >
        <div class="location-image" :style="{ backgroundImage: `url(${location.image})` }">
          <div class="location-overlay">
            <h3>{{ location.name }}</h3>
            <p>{{ location.description }}</p>
            <div class="fish-preview">
              <span v-for="fish in location.fish" :key="fish.name" class="fish-emoji">
                {{ fish.emoji }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LocationSelector',
  props: {
    locations: {
      type: Array,
      required: true
    }
  },
  methods: {
    goToLocation(location) {
      this.$router.push(`/location/${location.id}`)
    }
  }
}
</script>

<style scoped>
.location-selector {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  height: fit-content;
}

.location-selector h2 {
  margin-bottom: 15px;
  color: #333;
}

.locations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.location-card {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 3px solid transparent;
}

.location-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  border-color: #4CAF50;
}

.location-image {
  height: 100px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.location-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 10px;
}

.location-overlay h3 {
  margin-bottom: 5px;
  font-size: 1em;
}

.location-overlay p {
  font-size: 0.7em;
  opacity: 0.9;
  margin-bottom: 5px;
}

.fish-preview {
  display: flex;
  gap: 5px;
}

.fish-emoji {
  font-size: 0.8em;
}
</style>