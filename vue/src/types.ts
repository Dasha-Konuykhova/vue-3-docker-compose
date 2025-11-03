export interface Fish {
  name: string
  emoji: string
  strength: number
}

export interface Location {
  id: number
  name: string
  image: string
  description: string
  fish: Fish[]
}

export interface CaughtFish extends Fish {
  location: string
  timestamp: string
}

export type FishingState = 'idle' | 'casting' | 'waiting' | 'fighting' | 'success' | 'failed'

export interface FishingResult {
  type: 'success' | 'failed'
  message: string
}

export interface FishingModuleState {
  caughtFish: CaughtFish[]
  currentLocation: Location | null
}

export interface GameModuleState {
  fishingState: FishingState
  isReeling: boolean
  fishingResult: FishingResult | null
  currentFish: Fish | null
  tension: number
  gameInterval: NodeJS.Timeout | null
  biteTimeout: NodeJS.Timeout | null
  showResult: boolean
}

export interface ActionContext {
  commit: Function
  dispatch: Function
  state: any
  getters: any
  rootState: any
  rootGetters: any
}

export interface RootState {
  fishing: FishingModuleState
  game: GameModuleState
}

export interface StoreModules {
  fishing: FishingModuleState
  game: GameModuleState
}