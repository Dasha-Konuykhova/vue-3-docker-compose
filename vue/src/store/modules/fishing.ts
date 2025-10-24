import type { CaughtFish, Location } from '@/types'
import { locations } from '@/data/locations'
import type { FishingState } from './types'

export const fishingModule = {
  namespaced: true,

  state: (): FishingState => ({
    caughtFish: [],
    currentLocation: null
  }),

  getters: {
    caughtFish: (state: FishingState) => state.caughtFish,
    currentLocation: (state: FishingState) => state.currentLocation,
    totalFishCaught: (state: FishingState) => state.caughtFish.length,

    fishByLocation: (state: FishingState) => {
      const grouped: Record<string, CaughtFish[]> = {}
      state.caughtFish.forEach((fish: CaughtFish) => {
        if (!grouped[fish.location]) {
          grouped[fish.location] = []
        }
        grouped[fish.location].push(fish)
      })
      return grouped
    },

    getLocationById: () => (id: number): Location | undefined => {
      return locations.find(loc => loc.id === id)
    }
  },

  mutations: {
    ADD_FISH: (state: FishingState, fish: CaughtFish) => {
      state.caughtFish.unshift(fish)
    },

    SET_CURRENT_LOCATION: (state: FishingState, location: Location) => {
      state.currentLocation = location
    },

    CLEAR_INVENTORY: (state: FishingState) => {
      state.caughtFish = []
    }
  },

  actions: {
    addFish({ commit }: { commit: Function }, fish: CaughtFish) {
      commit('ADD_FISH', fish)
    },

    setCurrentLocation({ commit }: { commit: Function }, location: Location) {
      commit('SET_CURRENT_LOCATION', location)
    },

    clearInventory({ commit }: { commit: Function }) {
      commit('CLEAR_INVENTORY')
    }
  }
}