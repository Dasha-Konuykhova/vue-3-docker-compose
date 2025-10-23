<template>
  <div class="fishing-area">
    <div class="fishing-background" :style="{ backgroundImage: `url(${location.image})` }">
      <div class="fishing-content">
        <div class="location-info">
          <h2>{{ location.name }}</h2>
          <p>{{ location.description }}</p>
        </div>

        <div class="tension-meter" v-if="gameStore.fishingState === 'fighting'">
          <div class="tension-label">Натяжение лески: {{ Math.round(gameStore.tension) }}%</div>
          <div class="tension-bar">
            <div
              class="tension-fill"
              :style="{ width: gameStore.tension + '%' }"
              :class="getTensionClass()"
            ></div>
          </div>
          <div class="tension-hint">
            {{ getTensionHint() }}
          </div>
        </div>

        <div class="fishing-controls">
          <button
            class="fish-button"
            @click="startFishing"
            :disabled="gameStore.fishingState !== 'idle'"
            v-if="gameStore.fishingState === 'idle'"
          >
            🎣 Забросить удочку
          </button>

          <button
            class="reel-button"
            @mousedown="startReeling"
            @mouseup="stopReeling"
            @touchstart="startReeling"
            @touchend="stopReeling"
            :disabled="gameStore.fishingState !== 'fighting'"
            v-if="gameStore.fishingState === 'fighting'"
          >
            🎣 ТЯНУТЬ (Удерживайте ЛКМ)
          </button>

          <div class="result-container" v-if="gameStore.showResult">
            <div class="success-message" v-if="gameStore.fishingResult && gameStore.fishingResult.type === 'success'">
              <div class="success-icon">🎉</div>
              <div class="success-text">
                <h3>Поймали!</h3>
                <p>{{ gameStore.currentFish?.emoji }} {{ gameStore.currentFish?.name }}</p>
              </div>
            </div>

            <div class="failed-message" v-if="gameStore.fishingResult && gameStore.fishingResult.type === 'failed'">
              <div class="failed-icon">❌</div>
              <div class="failed-text">
                <h3>Рыба ушла!</h3>
                <p>{{ gameStore.fishingResult.message }}</p>
              </div>
            </div>
          </div>

          <div class="fishing-hint" v-if="gameStore.fishingState === 'waiting'">
            ⏳ Ждем поклевки...
          </div>

          <div class="fishing-hint" v-if="gameStore.fishingState === 'fighting'">
            🎣 Удерживайте ЛКМ чтобы вытащить рыбу! Цель: натяжение ≤ 10%
          </div>
        </div>

        <div class="fishing-rod-container">
          <div class="fishing-rod" :class="{
            casting: gameStore.fishingState === 'casting',
            waiting: gameStore.fishingState === 'waiting',
            reeling: gameStore.isReeling
          }">
            <div class="rod-handle"></div>
            <div class="rod-line"></div>
            <div class="fishing-hook" :class="{ biting: gameStore.fishingState === 'fighting' }"></div>
          </div>

          <div
            class="biting-fish"
            v-if="gameStore.fishingState === 'fighting' && gameStore.currentFish"
          >
            {{ gameStore.currentFish.emoji }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import type { Location, Fish } from '../types'
import { useGameStore } from '../stores/game'

const props = defineProps<{
  location: Location
}>()

const emit = defineEmits<{
  'catch-fish': [fish: Fish & { location: string }]
}>()

const gameStore = useGameStore()

const startFishing = async () => {
  console.log('🎣 Начинаем рыбалку')
  gameStore.setFishingState('casting')
  gameStore.setFishingResult(null)
  gameStore.setShowResult(false)
  gameStore.setTension(0)
  gameStore.setCurrentFish(null)

  await new Promise(resolve => setTimeout(resolve, 1500))
  gameStore.setFishingState('waiting')
  console.log('⏳ Ждем поклевки...')

  const waitTime = Math.random() * 3000 + 2000
  await new Promise(resolve => setTimeout(resolve, waitTime))

  fishBite()
}

const fishBite = () => {
  console.log('🐟 Рыба клюнула!')
  gameStore.setFishingState('fighting')
  gameStore.setCurrentFish(getRandomFish())

  const initialTension = Math.floor(Math.random() * 30) + 40
  gameStore.setTension(initialTension)

  console.log('Выпала рыба:', gameStore.currentFish)
  console.log('Начальное натяжение:', initialTension + '%')

  const interval = setInterval(() => {
    gameLoop()
  }, 200)
  gameStore.setGameInterval(interval)
}

const gameLoop = () => {
  if (gameStore.fishingState !== 'fighting') return

  const fishStrength = gameStore.currentFish?.strength || 1
  let newTension = gameStore.tension

  if (gameStore.isReeling) {
    newTension = gameStore.tension - 3
  }
  else {
    newTension = gameStore.tension + 1 + (fishStrength * 0.3)
  }

  newTension = Math.round(newTension)
  gameStore.setTension(newTension)
  console.log('🎣 Натяжение:', newTension + '%')

  checkGameConditions()
}

const checkGameConditions = () => {
  if (gameStore.tension >= 100) {
    fishEscape('💥 Леска порвалась! Рыба ушла')
    return
  }

  if (gameStore.tension <= 10) {
    catchSuccess()
    return
  }
}

const stopGameLoop = () => {
  if (gameStore.gameInterval) {
    clearInterval(gameStore.gameInterval)
    gameStore.setGameInterval(null)
  }
}

const startReeling = () => {
  if (gameStore.fishingState !== 'fighting') return
  gameStore.setIsReeling(true)
}

const stopReeling = () => {
  gameStore.setIsReeling(false)
}

const catchSuccess = () => {
  console.log('✅ Рыба поймана!', gameStore.currentFish)

  stopGameLoop()
  gameStore.setFishingState('success')
  gameStore.setIsReeling(false)

  const fishWithLocation = {
    ...gameStore.currentFish!,
    location: props.location.name
  }

  emit('catch-fish', fishWithLocation)

  gameStore.setFishingResult({
    type: 'success',
    message: `Поймали ${gameStore.currentFish!.emoji} ${gameStore.currentFish!.name}!`
  })

  gameStore.setShowResult(true)

  setTimeout(() => {
    returnToIdle()
  }, 3000)
}

const fishEscape = (message: string) => {
  stopGameLoop()
  gameStore.setFishingState('failed')
  gameStore.setIsReeling(false)

  gameStore.setFishingResult({
    type: 'failed',
    message: message
  })

  gameStore.setShowResult(true)

  setTimeout(() => {
    returnToIdle()
  }, 3000)
}

const returnToIdle = () => {
  gameStore.resetGame()
}

const getRandomFish = () => {
  const fishArray = props.location.fish
  const fish = fishArray[Math.floor(Math.random() * fishArray.length)]
  return fish
}

const getTensionClass = () => {
  return gameStore.getTensionClass()
}

const getTensionHint = () => {
  return gameStore.getTensionHint()
}

onUnmounted(() => {
  stopGameLoop()
})
</script>

<style scoped lang="less">
@safe-color: #4CAF50;
@warning-color: #FF9800;
@danger-color: #f44336;
@success-bg: #E8F5E8;
@failed-bg: #FFEBEE;
@rod-color: #8B4513;
@hook-color: #FFD700;
@text-dark: #333;
@text-darker: #000;
@success-text: #2E7D32;
@failed-text: #C62828;

.fishing-area {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  height: 600px;
  position: relative;

  .fishing-background {
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;

    .fishing-content {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.4);
      color: white;

      .location-info {
        padding: 20px;
        background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
        z-index: 2;

        h2 {
          color: white;
          margin-bottom: 8px;
        }

        p {
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .tension-meter {
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 10px;
        margin: 20px auto;
        max-width: 400px;
        backdrop-filter: blur(10px);
        z-index: 3;

        .tension-label {
          color: white;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .tension-bar {
          position: relative;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 8px;

          .tension-fill {
            height: 100%;
            border-radius: 15px;
            transition: width 0.1s ease, background-color 0.3s ease;

            &.safe {
              background: linear-gradient(90deg, @safe-color, lighten(@safe-color, 10%));
            }

            &.warning {
              background: linear-gradient(90deg, @warning-color, lighten(@warning-color, 10%));
            }

            &.danger {
              background: linear-gradient(90deg, @danger-color, lighten(@danger-color, 10%));
              animation: pulse-danger 0.5s infinite alternate;
            }
          }
        }

        .tension-hint {
          color: #FFC107;
          font-size: 0.9em;
          text-align: center;
          margin-top: 5px;
        }
      }

      .fishing-controls {
        text-align: center;
        padding: 20px;
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;

        .fish-button, .reel-button {
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

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          }
        }

        .fish-button {
          background: linear-gradient(135deg, @safe-color, darken(@safe-color, 10%));
        }

        .reel-button {
          background: linear-gradient(135deg, #2196F3, #1976D2);
        }

        .fish-button:disabled,
        .reel-button:disabled {
          background: #666;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .result-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          animation: popIn 0.5s ease-out;

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
            border-color: @safe-color;
            background: linear-gradient(135deg, @success-bg, lighten(@success-bg, 5%));

            .success-text {
              h3 {
                color: @success-text;
                margin: 0 0 10px 0;
                font-size: 1.5em;
              }

              p {
                color: @text-dark;
                margin: 0;
                font-size: 1.3em;
                font-weight: bold;
              }
            }
          }

          .failed-message {
            border-color: @danger-color;
            background: linear-gradient(135deg, @failed-bg, lighten(@failed-bg, 5%));

            .failed-text {
              h3 {
                color: @failed-text;
                margin: 0 0 10px 0;
                font-size: 1.5em;
              }

              p {
                color: @text-dark;
                margin: 0;
                font-size: 1.3em;
                font-weight: bold;
              }
            }
          }

          .success-icon, .failed-icon {
            font-size: 3em;
            animation: bounce 1s infinite;
          }
        }

        .fishing-hint {
          color: #FFC107;
          text-align: center;
          font-size: 0.9em;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
      }

      .fishing-rod-container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        z-index: 5;
        pointer-events: none;

        .fishing-rod {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          transform-origin: bottom center;
          z-index: 1;
          transition: all 0.5s ease;

          &.casting {
            animation: castRod 1.5s ease;
          }

          &.waiting {
            animation: waitRod 2s infinite alternate;
          }

          &.reeling {
            animation: reelRod 0.3s infinite alternate;
          }

          .rod-handle {
            width: 6px;
            height: 80px;
            background: linear-gradient(to right, @rod-color, lighten(@rod-color, 10%), @rod-color);
            border-radius: 3px;
            position: relative;
            z-index: 1;
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
            border: 2px solid @hook-color;
            border-top: none;
            border-right: none;
            border-radius: 0 0 0 50%;
            transform-origin: top left;
            transform: translateX(-50%) rotate(-45deg);

            &.biting {
              animation: biteHook 0.5s infinite alternate;
            }
          }
        }

        .biting-fish {
          position: absolute;
          bottom: 130px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 32px;
          z-index: 2;
          animation: bite 0.5s infinite alternate;
          filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      }
    }
  }
}

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

    .fishing-controls .result-container {
      .success-message, .failed-message {
        min-width: 250px;
        padding: 20px;
      }
    }

    .fishing-rod-container {
      .rod-line {
        height: 120px;
      }

      .biting-fish {
        bottom: 100px;
      }
    }
  }
}
</style>