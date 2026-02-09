import { create } from 'zustand'
import { Encounter, CombatParticipant, CombatLog, Condition, Effect } from '@/types/combat'

interface CombatStore {
  currentEncounter: Encounter | null
  isConnected: boolean
  isDM: boolean
  
  setEncounter: (encounter: Encounter) => void
  updateParticipant: (id: string, updates: Partial<CombatParticipant>) => void
  addLog: (log: Omit<CombatLog, 'id' | 'timestamp'>) => void
  nextTurn: () => void
  startCombat: () => void
  endCombat: () => void
  addCondition: (participantId: string, condition: Condition) => void
  removeCondition: (participantId: string, conditionId: string) => void
  addEffect: (participantId: string, effect: Effect) => void
  removeEffect: (participantId: string, effectId: string) => void
  rollInitiative: (participantId: string, roll: number) => void
  dealDamage: (participantId: string, damage: number) => void
  healDamage: (participantId: string, amount: number) => void
  setIsDM: (isDM: boolean) => void
  setConnected: (connected: boolean) => void
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  currentEncounter: null,
  isConnected: false,
  isDM: true,
  
  setEncounter: (encounter) => set({ currentEncounter: encounter }),
  
  setIsDM: (isDM) => set({ isDM }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  updateParticipant: (id, updates) => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === id ? { ...p, ...updates } : p
        )
      }
    }
  }),
  
  addLog: (log) => set((state) => {
    if (!state.currentEncounter) return state
    
    const newLog: CombatLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        logs: [...state.currentEncounter.logs, newLog]
      }
    }
  }),
  
  nextTurn: () => set((state) => {
    if (!state.currentEncounter || state.currentEncounter.status !== 'active') return state
    
    const participants = state.currentEncounter.participants
      .filter(p => !p.isDead)
      .sort((a, b) => (b.initiativeRoll || 0) - (a.initiativeRoll || 0))
    
    // Process end-of-turn effects
    participants.forEach(participant => {
      participant.conditions = participant.conditions
        .map(c => ({ ...c, duration: c.duration - 1 }))
        .filter(c => c.duration > 0)
      
      participant.effects = participant.effects
        .map(e => ({ ...e, duration: e.duration - 1 }))
        .filter(e => e.duration > 0)
    })
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        round: state.currentEncounter.round + 1,
        participants
      }
    }
  }),
  
  startCombat: () => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        status: 'active',
        round: 1
      }
    }
  }),
  
  endCombat: () => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        status: 'completed'
      }
    }
  }),
  
  addCondition: (participantId, condition) => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId
            ? { ...p, conditions: [...p.conditions, condition] }
            : p
        )
      }
    }
  }),
  
  removeCondition: (participantId, conditionId) => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId
            ? { ...p, conditions: p.conditions.filter(c => c.id !== conditionId) }
            : p
        )
      }
    }
  }),
  
  addEffect: (participantId, effect) => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId
            ? { ...p, effects: [...p.effects, effect] }
            : p
        )
      }
    }
  }),
  
  removeEffect: (participantId, effectId) => set((state) => {
    if (!state.currentEncounter) return state
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId
            ? { ...p, effects: p.effects.filter(e => e.id !== effectId) }
            : p
        )
      }
    }
  }),
  
  rollInitiative: (participantId, roll) => set((state) => {
    if (!state.currentEncounter) return state
    
    const participant = state.currentEncounter.participants.find(p => p.id === participantId)
    if (!participant) return state
    
    get().addLog({
      round: state.currentEncounter.round,
      action: 'initiative',
      actor: participant.name,
      details: { roll }
    })
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId ? { ...p, initiativeRoll: roll } : p
        )
      }
    }
  }),
  
  dealDamage: (participantId, damage) => set((state) => {
    if (!state.currentEncounter) return state
    
    const participant = state.currentEncounter.participants.find(p => p.id === participantId)
    if (!participant) return state
    
    const newHp = Math.max(0, participant.hp - damage)
    const isDead = newHp === 0
    
    get().addLog({
      round: state.currentEncounter.round,
      action: 'damage',
      actor: 'DM',
      target: participant.name,
      details: { damage, newHp, isDead }
    })
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId ? { ...p, hp: newHp, isDead } : p
        )
      }
    }
  }),
  
  healDamage: (participantId, amount) => set((state) => {
    if (!state.currentEncounter) return state
    
    const participant = state.currentEncounter.participants.find(p => p.id === participantId)
    if (!participant) return state
    
    const newHp = Math.min(participant.maxHp, participant.hp + amount)
    
    get().addLog({
      round: state.currentEncounter.round,
      action: 'heal',
      actor: 'DM',
      target: participant.name,
      details: { amount, newHp }
    })
    
    return {
      currentEncounter: {
        ...state.currentEncounter,
        participants: state.currentEncounter.participants.map(p =>
          p.id === participantId ? { ...p, hp: newHp, isDead: false } : p
        )
      }
    }
  }),
}))
