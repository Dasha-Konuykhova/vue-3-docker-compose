import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CaughtFish, Fish, Location } from '../types'
import { locations } from '@/data/locations'

export const useFishingStore = defineStore('fishing', () => {
  const caughtFish = ref<CaughtFish[]>([])
  const currentLocation = ref<Location | null>(null)
  
  const totalFishCaught = computed(() => caughtFish.value.length)
  const fishByLocation = computed(() => {
    const grouped: Record<string, CaughtFish[]> = {}
    caughtFish.value.forEach(fish => {
      if (!grouped[fish.location]) {
        grouped[fish.location] = []
      }
      grouped[fish.location]!.push(fish)
    })
    return grouped
  })
  
  const addFish = (fish: CaughtFish) => {
    console.log('Store: Добавляем рыбу в инвентарь', fish)
    caughtFish.value.unshift(fish)
    console.log('Store: Текущий улов', caughtFish.value)
  }
  
  const setCurrentLocation = (location: Location) => {
    currentLocation.value = location
  }
  
  const getLocationById = (id: number): Location | undefined => {
    return locations.find(loc => loc.id === id)
  }
  
  const clearInventory = () => {
    caughtFish.value = []
  }
  
  return {
    caughtFish,
    currentLocation,
    totalFishCaught,
    fishByLocation,
    addFish,
    setCurrentLocation,
    getLocationById,
    clearInventory
  }
})
