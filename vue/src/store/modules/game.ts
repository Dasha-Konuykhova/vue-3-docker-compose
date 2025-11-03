import type { FishingState, Fish, FishingResult, GameModuleState } from '@/types'

export const gameModule = {
  namespaced: true,

  state: (): GameModuleState => ({
    fishingState: 'idle',
    isReeling: false,
    fishingResult: null,
    currentFish: null,
    tension: 0,
    gameInterval: null,
    biteTimeout: null,
    showResult: false
  }),

  getters: {
    fishingState: (state: GameModuleState) => state.fishingState,
    isReeling: (state: GameModuleState) => state.isReeling,
    tension: (state: GameModuleState) => state.tension,
    currentFish: (state: GameModuleState) => state.currentFish,
    showResult: (state: GameModuleState) => state.showResult,
    fishingResult: (state: GameModuleState) => state.fishingResult,

    tensionClass: (state: GameModuleState) => {
      if (state.tension < 40) return 'safe'
      if (state.tension < 70) return 'warning'
      return 'danger'
    },

    tensionHint: (state: GameModuleState) => {
      if (state.tension < 20) return 'Тяните сильнее!'
      if (state.tension < 60) return 'Хорошо! Продолжайте'
      return 'Осторожно! Слишком сильно!'
    }
  },

  mutations: {
    SET_FISHING_STATE: (state: GameModuleState, stateValue: FishingState) => {
      state.fishingState = stateValue
    },

    SET_IS_REELING: (state: GameModuleState, reeling: boolean) => {
      state.isReeling = reeling
    },

    SET_TENSION: (state: GameModuleState, tension: number) => {
      state.tension = Math.max(0, Math.min(100, tension))
    },

    SET_CURRENT_FISH: (state: GameModuleState, fish: Fish | null) => {
      state.currentFish = fish
    },

    SET_FISHING_RESULT: (state: GameModuleState, result: FishingResult | null) => {
      state.fishingResult = result
    },

    SET_SHOW_RESULT: (state: GameModuleState, show: boolean) => {
      state.showResult = show
    },

    SET_GAME_INTERVAL: (state: GameModuleState, interval: NodeJS.Timeout | null) => {
      state.gameInterval = interval
    },

    SET_BITE_TIMEOUT: (state: GameModuleState, timeout: NodeJS.Timeout | null) => {
      state.biteTimeout = timeout
    },

    RESET_GAME: (state: GameModuleState) => {
      state.fishingState = 'idle'
      state.isReeling = false
      state.fishingResult = null
      state.currentFish = null
      state.tension = 0
      state.showResult = false
      state.gameInterval = null
      state.biteTimeout = null
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

    setGameInterval({ commit, state }: { commit: Function; state: GameModuleState }, interval: NodeJS.Timeout | null) {
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
      }
      commit('SET_GAME_INTERVAL', interval)
    },

    setBiteTimeout({ commit, state }: { commit: Function; state: GameModuleState }, timeout: NodeJS.Timeout | null) {
      if (state.biteTimeout) {
        clearTimeout(state.biteTimeout)
      }
      commit('SET_BITE_TIMEOUT', timeout)
    },

    clearGameInterval({ commit, state }: { commit: Function; state: GameModuleState }) {
      if (state.gameInterval) {
        clearInterval(state.gameInterval)
        commit('SET_GAME_INTERVAL', null)
      }
    },

    clearBiteTimeout({ commit, state }: { commit: Function; state: GameModuleState }) {
      if (state.biteTimeout) {
        clearTimeout(state.biteTimeout)
        commit('SET_BITE_TIMEOUT', null)
      }
    },

    resetGame({ commit, dispatch }: { commit: Function; dispatch: Function }) {
      dispatch('clearGameInterval')
      dispatch('clearBiteTimeout')
      commit('RESET_GAME')
    },

    startFishing({ dispatch, commit, state }: { dispatch: Function; commit: Function; state: GameModuleState }) {
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

          dispatch('setBiteTimeout', biteTimeout)
        }
      }, 1500)
    },

    fishBite({ commit, dispatch, rootGetters, state }: { commit: Function; dispatch: Function; rootGetters: any; state: GameModuleState }) {
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
      dispatch('setGameInterval', interval)
    },

    gameLoop({ state, commit, dispatch }: { state: GameModuleState; commit: Function; dispatch: Function }) {
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

    checkGameConditions({ state, commit, dispatch }: { state: GameModuleState; commit: Function; dispatch: Function }) {
      if (state.tension >= 100) {
        dispatch('fishEscape', 'Леска порвалась! Рыба ушла')
        return
      }

      if (state.tension <= 10) {
        dispatch('catchSuccess')
        return
      }
    },

    catchSuccess({ state, commit, dispatch }: { state: GameModuleState; commit: Function; dispatch: Function }) {
      commit('SET_FISHING_STATE', 'success')
      commit('SET_IS_REELING', false)
      dispatch('clearGameInterval')

      commit('SET_FISHING_RESULT', {
        type: 'success',
        message: `Поймали ${state.currentFish?.emoji} ${state.currentFish?.name}!`
      })
      commit('SET_SHOW_RESULT', true)

      setTimeout(() => {
        dispatch('resetGame')
      }, 3000)
    },

    fishEscape({ dispatch, commit, state }: { dispatch: Function; commit: Function; state: GameModuleState }, message: string) {
      if (state.fishingState === 'failed') {
        return
      }

      dispatch('clearGameInterval')
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

    stopGameLoop({ dispatch }: { dispatch: Function }) {
      dispatch('clearGameInterval')
      dispatch('clearBiteTimeout')
    }
  }
}