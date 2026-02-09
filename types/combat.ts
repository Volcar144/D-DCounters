export interface Condition {
  id: string
  name: string
  duration: number // in rounds
  description: string
}

export interface Effect {
  id: string
  name: string
  type: 'buff' | 'debuff' | 'damage' | 'heal'
  value: number
  duration: number // in rounds
  description: string
}

export interface CombatParticipant {
  id: string
  name: string
  type: 'character' | 'monster' | 'npc'
  hp: number
  maxHp: number
  ac: number
  initiative: number
  initiativeRoll?: number
  conditions: Condition[]
  effects: Effect[]
  isDead: boolean
  isPlayer: boolean
  monsterData?: any
}

export interface CombatLog {
  id: string
  round: number
  action: string
  actor: string
  target?: string
  details: any
  timestamp: Date
}

export interface Encounter {
  id: string
  name: string
  description?: string
  difficulty?: string
  status: 'preparing' | 'active' | 'completed'
  round: number
  participants: CombatParticipant[]
  logs: CombatLog[]
}
