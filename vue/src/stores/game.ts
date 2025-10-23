import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FishingState, Fish, FishingResult } from '../types'

export const useGameStore = defineStore('game', () => {
  const fishingState = ref<FishingState>('idle')
  const isReeling = ref<boolean>(false)
  const fishingResult = ref<FishingResult | null>(null)
  const currentFish = ref<Fish | null>(null)
  const tension = ref<number>(0)
  const gameInterval = ref<NodeJS.Timeout | null>(null)
  const showResult = ref<boolean>(false)
  
  const setFishingState = (state: FishingState) => {
    fishingState.value = state
  }
  
  const setIsReeling = (reeling: boolean) => {
    isReeling.value = reeling
  }
  
  const setTension = (newTension: number) => {
    tension.value = Math.max(0, Math.min(100, newTension))
  }
  
  const setCurrentFish = (fish: Fish | null) => {
    currentFish.value = fish
  }
  
  const setFishingResult = (result: FishingResult | null) => {
    fishingResult.value = result
  }
  
  const setShowResult = (show: boolean) => {
    showResult.value = show
  }
  
  const setGameInterval = (interval: NodeJS.Timeout | null) => {
    gameInterval.value = interval
  }
  
  const resetGame = () => {
    fishingState.value = 'idle'
    isReeling.value = false
    fishingResult.value = null
    currentFish.value = null
    tension.value = 0
    showResult.value = false
    if (gameInterval.value) {
      clearInterval(gameInterval.value)
      gameInterval.value = null
    }
  }
  
  const getTensionClass = () => {
    if (tension.value < 40) return 'safe'
    if (tension.value < 70) return 'warning'
    return 'danger'
  }
  
  const getTensionHint = () => {
    if (tension.value < 20) return 'Тяните сильнее! Цель: ≤ 10%'
    if (tension.value < 60) return 'Хорошо! Продолжайте'
    return 'Осторожно! Слишком сильно!'
  }
  
  return {
    fishingState,
    isReeling,
    fishingResult,
    currentFish,
    tension,
    gameInterval,
    showResult,
    setFishingState,
    setIsReeling,
    setTension,
    setCurrentFish,
    setFishingResult,
    setShowResult,
    setGameInterval,
    resetGame,
    getTensionClass,
    getTensionHint
  }
})
