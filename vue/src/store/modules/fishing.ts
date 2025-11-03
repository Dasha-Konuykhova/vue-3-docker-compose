import type { CaughtFish, Location, FishingModuleState, ActionContext } from '@/types'
import { locations } from '@/data/locations'

export const fishingModule = {
  namespaced: true,

  state: (): FishingModuleState => ({
    caughtFish: [],
    currentLocation: null
  }),

  getters: {
    caughtFish: (state: FishingModuleState): CaughtFish[] => state.caughtFish,
    currentLocation: (state: FishingModuleState): Location | null => state.currentLocation,
    totalFishCaught: (state: FishingModuleState): number => state.caughtFish.length,

    fishByLocation: (state: FishingModuleState): Record<string, CaughtFish[]> => {
      const grouped: Record<string, CaughtFish[]> = {}
      state.caughtFish.forEach((fish: CaughtFish) => {
        if (!grouped[fish.location]) {
          grouped[fish.location] = []
        }
        grouped[fish.location].push(fish)
      })
      return grouped
    },

    getLocationById: (): ((id: number) => Location | undefined) => (id: number): Location | undefined => {
      return locations.find(loc => loc.id === id)
    }
  },

  mutations: {
    ADD_FISH: (state: FishingModuleState, fish: CaughtFish): void => {
      state.caughtFish.unshift(fish)
    },

    SET_CURRENT_LOCATION: (state: FishingModuleState, location: Location): void => {
      state.currentLocation = location
    },

    CLEAR_INVENTORY: (state: FishingModuleState): void => {
      state.caughtFish = []
    }
  },

  actions: {
    addFish({ commit }: ActionContext, fish: CaughtFish): void {
      commit('ADD_FISH', fish)
    },

    setCurrentLocation({ commit }: ActionContext, location: Location): void {
      commit('SET_CURRENT_LOCATION', location)
    },

    clearInventory({ commit }: ActionContext): void {
      commit('CLEAR_INVENTORY')
    }
  }
}