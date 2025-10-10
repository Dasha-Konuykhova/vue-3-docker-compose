<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      caughtFish: []
    }
  },
  methods: {
    addFish(fish) {
      console.log('App: Добавляем рыбу в инвентарь', fish)
      this.caughtFish.unshift(fish)
      console.log('App: Текущий улов', this.caughtFish)
    }
  },
  provide() {
    return {
      caughtFish: this.caughtFish,
      addFish: this.addFish
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
  padding: 20px;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #f5f5f5;
}

button:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}
</style>