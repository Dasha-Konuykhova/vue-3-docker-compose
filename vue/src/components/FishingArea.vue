<template>
  <div class="fishing-area">
    <div class="fishing-background" :style="{ backgroundImage: `url(${location.image})` }">
      <div class="fishing-content">
        <div class="location-info">
          <h2>{{ location.name }}</h2>
          <p>{{ location.description }}</p>
        </div>

        <!-- Индикатор натяжения -->
        <div class="tension-meter" v-if="fishingState === 'fighting'">
          <div class="tension-label">Натяжение лески: {{ tension }}%</div>
          <div class="tension-bar">
            <div
              class="tension-fill"
              :style="{ width: tension + '%' }"
              :class="getTensionClass()"
            ></div>
          </div>
          <div class="tension-hint">
            {{ getTensionHint() }}
          </div>
        </div>

        <!-- Элементы управления -->
        <div class="fishing-controls">
          <button
            class="fish-button"
            @click="startFishing"
            :disabled="fishingState !== 'idle'"
            v-if="fishingState === 'idle'"
          >
            🎣 Забросить удочку
          </button>

          <button
            class="reel-button"
            @mousedown="startReeling"
            @mouseup="stopReeling"
            @touchstart="startReeling"
            @touchend="stopReeling"
            :disabled="fishingState !== 'fighting'"
            v-if="fishingState === 'fighting'"
          >
            🎣 ТЯНУТЬ (Удерживайте ЛКМ)
          </button>

          <!-- РЕЗУЛЬТАТ -->
          <div class="result-container" v-if="showResult">
            <div class="success-message" v-if="fishingResult && fishingResult.type === 'success'">
              <div class="success-icon">🎉</div>
              <div class="success-text">
                <h3>Поймали!</h3>
                <p>{{ currentFish.emoji }} {{ currentFish.name }}</p>
              </div>
            </div>

            <div class="failed-message" v-if="fishingResult && fishingResult.type === 'failed'">
              <div class="failed-icon">❌</div>
              <div class="failed-text">
                <h3>Рыба ушла!</h3>
                <p>{{ fishingResult.message }}</p>
              </div>
            </div>
          </div>

          <div class="fishing-hint" v-if="fishingState === 'waiting'">
            ⏳ Ждем поклевки...
          </div>

          <div class="fishing-hint" v-if="fishingState === 'fighting'">
            🎣 Удерживайте ЛКМ чтобы вытащить рыбу! Цель: натяжение ≤ 10%
          </div>
        </div>

        <!-- УДОЧКА И РЫБА -->
        <div class="fishing-rod-container">
          <div class="fishing-rod" :class="{
            casting: fishingState === 'casting',
            waiting: fishingState === 'waiting',
            reeling: isReeling
          }">
            <div class="rod-handle"></div>
            <div class="rod-line"></div>
            <div class="fishing-hook" :class="{ biting: fishingState === 'fighting' }"></div>
          </div>

          <!-- Клюющая рыба -->
          <div
            class="biting-fish"
            v-if="fishingState === 'fighting' && currentFish"
          >
            {{ currentFish.emoji }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FishingArea',
  props: {
    location: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fishingState: 'idle',
      isReeling: false,
      fishingResult: null,
      currentFish: null,
      tension: 0,
      gameInterval: null,
      showResult: false
    }
  },
  methods: {
    async startFishing() {
      console.log('🎣 Начинаем рыбалку')
      this.fishingState = 'casting'
      this.fishingResult = null
      this.showResult = false
      this.tension = 0
      this.currentFish = null

      await new Promise(resolve => setTimeout(resolve, 1500))
      this.fishingState = 'waiting'
      console.log('⏳ Ждем поклевки...')

      const waitTime = Math.random() * 3000 + 2000
      await new Promise(resolve => setTimeout(resolve, waitTime))

      this.fishBite()
    },

    fishBite() {
      console.log('🐟 Рыба клюнула!')
      this.fishingState = 'fighting'
      this.currentFish = this.getRandomFish()
      this.tension = Math.floor(Math.random() * 30) + 40
      console.log('Выпала рыба:', this.currentFish)
      console.log('Начальное натяжение:', this.tension + '%')

      this.gameInterval = setInterval(() => {
        this.gameLoop()
      }, 200)
    },

    gameLoop() {
      if (this.fishingState !== 'fighting') return

      const fishStrength = this.currentFish.strength || 1

      if (this.isReeling) {
        this.tension = Math.max(0, this.tension - 3)
      }
      else {
        this.tension = Math.min(100, this.tension + 1 + (fishStrength * 0.3))
      }

      this.tension = Math.round(this.tension)

      console.log('🎣 Натяжение:', this.tension + '%')

      this.checkGameConditions()
    },

    checkGameConditions() {
      if (this.tension >= 100) {
        this.fishEscape('💥 Леска порвалась! Рыба ушла')
        return
      }

      if (this.tension <= 10) {
        this.catchSuccess()
        return
      }
    },

    stopGameLoop() {
      if (this.gameInterval) {
        clearInterval(this.gameInterval)
        this.gameInterval = null
      }
    },

    startReeling() {
      if (this.fishingState !== 'fighting') return
      this.isReeling = true
    },

    stopReeling() {
      this.isReeling = false
    },

    catchSuccess() {
      console.log('✅ Рыба поймана!', this.currentFish)

      this.stopGameLoop()
      this.fishingState = 'success'
      this.isReeling = false

      // Эмитим событие с дополнительной информацией о локации
      const fishWithLocation = {
        ...this.currentFish,
        location: this.location.name
      }

      this.$emit('catch-fish', fishWithLocation)

      this.fishingResult = {
        type: 'success',
        message: `Поймали ${this.currentFish.emoji} ${this.currentFish.name}!`
      }

      this.showResult = true

      setTimeout(() => {
        this.returnToIdle()
      }, 3000)
    },

    fishEscape(message) {
      this.stopGameLoop()
      this.fishingState = 'failed'
      this.isReeling = false

      this.fishingResult = {
        type: 'failed',
        message: message
      }

      this.showResult = true

      setTimeout(() => {
        this.returnToIdle()
      }, 3000)
    },

    returnToIdle() {
      this.fishingState = 'idle'
      this.tension = 0
      this.currentFish = null
      this.fishingResult = null
      this.showResult = false
      this.isReeling = false
    },

    getRandomFish() {
      const fishArray = this.location.fish
      const fish = fishArray[Math.floor(Math.random() * fishArray.length)]
      return fish
    },

    getTensionClass() {
      if (this.tension < 40) return 'safe'
      if (this.tension < 70) return 'warning'
      return 'danger'
    },

    getTensionHint() {
      if (this.tension < 20) return 'Тяните сильнее! Цель: ≤ 10%'
      if (this.tension < 60) return 'Хорошо! Продолжайте'
      return 'Осторожно! Слишком сильно!'
    }
  },
  beforeUnmount() {
    this.stopGameLoop()
  }
}
</script>

<style scoped>
.fishing-area {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: 600px;
  position: relative;
}

.fishing-background {
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.fishing-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.4);
  color: white;
}

.location-info {
  padding: 20px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
  z-index: 2;
}

.tension-meter {
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 400px;
  backdrop-filter: blur(10px);
  z-index: 3;
}

.tension-bar {
  position: relative;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 8px;
}

.tension-fill {
  height: 100%;
  border-radius: 15px;
  transition: width 0.1s ease, background-color 0.3s ease;
}

.tension-fill.safe {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.tension-fill.warning {
  background: linear-gradient(90deg, #FF9800, #FFC107);
}

.tension-fill.danger {
  background: linear-gradient(90deg, #f44336, #FF5722);
  animation: pulse-danger 0.5s infinite alternate;
}

.fishing-controls {
  text-align: center;
  padding: 20px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.fish-button, .reel-button {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2em;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  min-width: 200px;
}

.reel-button {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.fish-button:disabled,
.reel-button:disabled {
  background: #666;
  cursor: not-allowed;
}

.result-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  animation: popIn 0.5s ease-out;
}

.success-message, .failed-message {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  text-align: center;
  min-width: 300px;
  border: 4px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.success-message {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #E8F5E8, #C8E6C9);
}

.failed-message {
  border-color: #f44336;
  background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
}

.success-icon, .failed-icon {
  font-size: 3em;
  animation: bounce 1s infinite;
}

.success-text h3, .failed-text h3 {
  margin: 0 0 10px 0;
  font-size: 1.5em;
  color: #333;
}

.success-text p, .failed-text p {
  margin: 0;
  font-size: 1.3em;
  font-weight: bold;
  color: #555;
}

.fishing-hint {
  color: #FFC107;
  text-align: center;
  font-size: 0.9em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* Стили для удочки */
.fishing-rod-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  z-index: 4;
  pointer-events: none;
}

.fishing-rod {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  transform-origin: bottom center;
  z-index: 5;
  transition: all 0.5s ease;
}

.fishing-rod.casting {
  animation: castRod 1.5s ease;
}

.fishing-rod.waiting {
  animation: waitRod 2s infinite alternate;
}

.fishing-rod.reeling {
  animation: reelRod 0.3s infinite alternate;
}

.rod-handle {
  width: 6px;
  height: 80px;
  background: linear-gradient(to right, #8B4513, #A0522D, #8B4513);
  border-radius: 3px;
  position: relative;
  z-index: 2;
}

.rod-line {
  width: 2px;
  height: 150px;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.4) 100%);
  margin: 0 auto;
  position: relative;
  top: -5px;
}

.fishing-hook {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border: 2px solid #FFD700;
  border-top: none;
  border-right: none;
  border-radius: 0 0 0 50%;
  transform-origin: top left;
  transform: translateX(-50%) rotate(-45deg);
}

.fishing-hook.biting {
  animation: biteHook 0.5s infinite alternate;
}

.biting-fish {
  position: absolute;
  bottom: 130px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  z-index: 4;
  animation: bite 0.5s infinite alternate;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
}

/* Анимации для удочки */
@keyframes castRod {
  0% {
    transform: translateX(-50%) rotate(0deg);
    bottom: 20px;
  }
  50% {
    transform: translateX(-50%) rotate(-60deg);
    bottom: 30px;
  }
  100% {
    transform: translateX(-50%) rotate(0deg);
    bottom: 20px;
  }
}

@keyframes waitRod {
  0% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) rotate(5deg); }
  100% { transform: translateX(-50%) rotate(0deg); }
}

@keyframes reelRod {
  0% { bottom: 20px; }
  100% { bottom: 25px; }
}

@keyframes biteHook {
  0% { transform: translateX(-50%) rotate(-45deg); }
  100% { transform: translateX(-50%) rotate(-35deg); }
}

@keyframes bite {
  0% { transform: translateX(-50%) translateY(0); }
  100% { transform: translateX(-50%) translateY(-10px); }
}

@keyframes pulse-danger {
  0% { opacity: 1; }
  100% { opacity: 0.7; }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .fishing-area {
    height: 500px;
  }

  .success-message, .failed-message {
    min-width: 250px;
    padding: 20px;
  }

  .fishing-controls {
    padding: 15px;
  }

  .rod-line {
    height: 120px;
  }

  .biting-fish {
    bottom: 100px;
  }
}
</style>