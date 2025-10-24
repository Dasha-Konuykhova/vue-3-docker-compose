import { createStore } from 'vuex'
import { fishingModule } from './modules/fishing'
import { gameModule } from './modules/game'

export default createStore({
  modules: {
    fishing: fishingModule,
    game: gameModule
  },

  strict: process.env.NODE_ENV !== 'production'
})