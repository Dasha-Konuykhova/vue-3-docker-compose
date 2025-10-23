<template>
  <div class="inventory">
    <h2>🎒 Улов ({{ caughtFish.length }})</h2>
    <div class="fish-list">
      <div
        v-for="(fish, index) in caughtFish"
        :key="index"
        class="fish-item"
      >
        <span class="fish-emoji">{{ fish.emoji }}</span>
        <span class="fish-name">{{ fish.name }}</span>
        <span class="fish-location">{{ fish.location }}</span>
        <span class="fish-timestamp">{{ fish.timestamp }}</span>
      </div>
      <div v-if="caughtFish.length === 0" class="empty-inventory">
        🎣 Рыбы пока нет!<br>
        <small>Выберите локацию и начните рыбалку</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CaughtFish } from '../types'

defineProps<{
  caughtFish: CaughtFish[]
}>()
</script>

<style scoped lang="less">
@bg-color: #f8f9fa;
@border-color: #dee2e6;
@text-color: #333;
@muted-color: #6c757d;

.inventory {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;

  h2 {
    color: @text-color;
    margin-bottom: 15px;
    text-align: center;
  }
}

.fish-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fish-item {
  background: @bg-color;
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid @border-color;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fish-emoji {
  font-size: 1.2em;
}

.fish-name {
  font-weight: bold;
  color: @text-color;
  flex: 1;
}

.fish-location {
  font-size: 0.8em;
  color: @muted-color;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 10px;
}

.fish-timestamp {
  font-size: 0.7em;
  color: #888;
}

.empty-inventory {
  text-align: center;
  color: @muted-color;
  font-style: italic;
  padding: 20px;

  small {
    display: block;
    margin-top: 8px;
    font-size: 0.9em;
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .fish-item {
    flex-wrap: wrap;
  }
}
</style>