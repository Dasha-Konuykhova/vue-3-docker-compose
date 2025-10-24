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