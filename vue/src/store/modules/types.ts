import type { FishingState, Fish, FishingResult, CaughtFish, Location } from '@/types'

export interface GameState {
  fishingState: FishingState
  isReeling: boolean
  fishingResult: FishingResult | null
  currentFish: Fish | null
  tension: number
  gameInterval: NodeJS.Timeout | null
  showResult: boolean
}

export interface FishingState {
  caughtFish: CaughtFish[]
  currentLocation: Location | null
}