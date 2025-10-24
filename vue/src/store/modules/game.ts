import type { FishingState, Fish, FishingResult } from '@/types'
import type { GameState } from './types'

export const gameModule = {
  namespaced: true,

  state: (): GameState => ({
    fishingState: 'idle',
    isReeling: false,
    fishingResult: null,
    currentFish: null,
    tension: 0,
    gameInterval: null,
    showResult: false
  }),

  getters: {
    fishingState: (state: GameState) => state.fishingState,
    isReeling: (state: GameState) => state.isReeling,
    tension: (state: GameState) => state.tension,
    currentFish: (state: GameState) => state.currentFish,
    showResult: (state: GameState) => state.showResult,
    fishingResult: (state: GameState) => state.fishingResult,

    tensionClass: (state: GameState) => {
      if (state.tension < 40) return 'safe'
      if (state.tension < 70) return 'warning'
      return 'danger'
    },

    tensionHint: (state: GameState) => {
      if (state.tension < 20) return 'Тяните сильнее!'
      if (state.tension < 60) return 'Хорошо! Продолжайте'
      return 'Осторожно! Слишком сильно!'
    }
  },

  mutations: {
    SET_FISHING_STATE: (state: GameState, stateValue: FishingState) => {
      state.fishingState = stateValue
    },

    SET_IS_REELING: (state: GameState, reeling: boolean) => {
      state.isReeling = reeling
    },

    SET_TENSION: (state: GameState, tension: number) => {
      state.tension = Math.max(0, Math.min(100, tension))
    },

    SET_CURRENT_FISH: (state: GameState, fish: Fish | null) => {
      state.currentFish = fish
    },

    SET_FISHING_RESULT: (state: GameState, result: FishingResult | null) => {
      state.fishingResult = result
    },

    SET_SHOW_RESULT: (state: GameState, show: boolean) => {
      state.showResult = show
    },

    SET_GAME_INTERVAL: (state: GameState, interval: NodeJS.Timeout | null) => {
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
      }
      state.gameInterval = interval
    },

    RESET_GAME: (state: GameState) => {
      state.fishingState = 'idle'
      state.isReeling = false
      state.fishingResult = null
      state.currentFish = null
      state.tension = 0
      state.showResult = false
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
        state.gameInterval = null
      }
    }
  },

  actions: {
    setFishingState({ commit }: { commit: Function }, stateValue: FishingState) {
      commit('SET_FISHING_STATE', stateValue)
    },

    setIsReeling({ commit }: { commit: Function }, reeling: boolean) {
      commit('SET_IS_REELING', reeling)
    },

    setTension({ commit }: { commit: Function }, tension: number) {
      commit('SET_TENSION', tension)
    },

    setCurrentFish({ commit }: { commit: Function }, fish: Fish | null) {
      commit('SET_CURRENT_FISH', fish)
    },

    setFishingResult({ commit }: { commit: Function }, result: FishingResult | null) {
      commit('SET_FISHING_RESULT', result)
    },

    setShowResult({ commit }: { commit: Function }, show: boolean) {
      commit('SET_SHOW_RESULT', show)
    },

    setGameInterval({ commit }: { commit: Function }, interval: NodeJS.Timeout | null) {
      commit('SET_GAME_INTERVAL', interval)
    },

    resetGame({ commit }: { commit: Function }) {
      commit('RESET_GAME')
    },

    startFishing({ dispatch, commit, state }: { dispatch: Function; commit: Function; state: GameState }) {
      if (state.fishingState !== 'idle') {
        return
      }

      commit('SET_FISHING_STATE', 'casting')
      commit('SET_FISHING_RESULT', null)
      commit('SET_SHOW_RESULT', false)
      commit('SET_TENSION', 0)
      commit('SET_CURRENT_FISH', null)

      setTimeout(() => {
        if (state.fishingState === 'casting') {
          commit('SET_FISHING_STATE', 'waiting')

          const waitTime = Math.random() * 3000 + 2000
          const biteTimeout = setTimeout(() => {
            dispatch('fishBite')
          }, waitTime)

          commit('SET_GAME_INTERVAL', biteTimeout as unknown as NodeJS.Timeout)
        }
      }, 1500)
    },

    fishBite({ commit, dispatch, rootGetters, state }: { commit: Function; dispatch: Function; rootGetters: any; state: GameState }) {
      if (state.fishingState !== 'waiting') {
        return
      }

      commit('SET_FISHING_STATE', 'fighting')

      const location = rootGetters['fishing/currentLocation']
      const randomFish = location.fish[Math.floor(Math.random() * location.fish.length)]
      commit('SET_CURRENT_FISH', randomFish)

      const initialTension = Math.floor(Math.random() * 30) + 40
      commit('SET_TENSION', initialTension)

      const interval = setInterval(() => {
        dispatch('gameLoop')
      }, 200)
      commit('SET_GAME_INTERVAL', interval)
    },

    gameLoop({ state, commit, dispatch }: { state: GameState; commit: Function; dispatch: Function }) {
      if (state.fishingState !== 'fighting') return

      const fishStrength = state.currentFish?.strength || 1
      let newTension = state.tension

      if (state.isReeling) {
        newTension = state.tension - 3
      } else {
        newTension = state.tension + 1 + (fishStrength * 0.3)
      }

      newTension = Math.round(newTension)
      commit('SET_TENSION', newTension)
      dispatch('checkGameConditions')
    },

    checkGameConditions({ state, commit, dispatch }: { state: GameState; commit: Function; dispatch: Function }) {
      if (state.tension >= 100) {
        dispatch('fishEscape', 'Леска порвалась! Рыба ушла')
        return
      }

      if (state.tension <= 10) {
        dispatch('catchSuccess')
        return
      }
    },

    catchSuccess({ state, commit, dispatch, rootGetters }: { state: GameState; commit: Function; dispatch: Function; rootGetters: any }) {
      commit('SET_FISHING_STATE', 'success')
      commit('SET_IS_REELING', false)
      dispatch('stopGameLoop')

      commit('SET_FISHING_RESULT', {
        type: 'success',
        message: `Поймали ${state.currentFish?.emoji} ${state.currentFish?.name}!`
      })
      commit('SET_SHOW_RESULT', true)

      setTimeout(() => {
        dispatch('resetGame')
      }, 3000)
    },

    fishEscape({ dispatch, commit, state }: { dispatch: Function; commit: Function; state: GameState }, message: string) {
      if (state.fishingState === 'failed') {
        return
      }

      dispatch('stopGameLoop')
      commit('SET_FISHING_STATE', 'failed')
      commit('SET_IS_REELING', false)

      commit('SET_FISHING_RESULT', {
        type: 'failed',
        message: message
      })
      commit('SET_SHOW_RESULT', true)

      setTimeout(() => {
        dispatch('resetGame')
      }, 3000)
    },

    stopGameLoop({ state, commit }: { state: GameState; commit: Function }) {
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
        commit('SET_GAME_INTERVAL', null)
      }
    }
  }
}