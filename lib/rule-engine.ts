import { CombatParticipant, Condition, Effect } from '@/types/combat'

export class RuleEngine {
  static applyConditionEffects(participant: CombatParticipant): CombatParticipant {
    let modified = { ...participant }

    participant.conditions.forEach(condition => {
      switch (condition.name.toLowerCase()) {
        case 'poisoned':
          // Poisoned creatures have disadvantage on attack rolls and ability checks
          // This would be handled in the combat system
          break
        
        case 'stunned':
          // Stunned creatures are incapacitated and automatically fail STR/DEX saves
          break
        
        case 'prone':
          // Prone creatures have disadvantage on attack rolls
          break
        
        case 'blinded':
          // Blinded creatures automatically fail sight-based checks
          break
        
        case 'frightened':
          // Frightened creatures have disadvantage on ability checks and attack rolls
          break
        
        case 'restrained':
          // Restrained creatures have disadvantage on DEX saves and attack rolls
          break
        
        case 'paralyzed':
          // Paralyzed creatures are incapacitated and automatically fail STR/DEX saves
          break
      }
    })

    return modified
  }

  static processEffects(participant: CombatParticipant): {
    participant: CombatParticipant
    damage: number
    healing: number
  } {
    let damage = 0
    let healing = 0
    let modified = { ...participant }

    participant.effects.forEach(effect => {
      switch (effect.type) {
        case 'damage':
          damage += effect.value
          break
        
        case 'heal':
          healing += effect.value
          break
        
        case 'buff':
          // Buffs would modify stats - implement stat modifications
          break
        
        case 'debuff':
          // Debuffs would modify stats - implement stat modifications
          break
      }
    })

    return { participant: modified, damage, healing }
  }

  static calculateAdvantage(participant: CombatParticipant, action: 'attack' | 'save' | 'check'): 'advantage' | 'disadvantage' | 'normal' {
    const hasAdvantage = participant.conditions.some(c => {
      // Conditions that grant advantage
      return false // Implement based on D&D 5e rules
    })

    const hasDisadvantage = participant.conditions.some(c => {
      const name = c.name.toLowerCase()
      switch (action) {
        case 'attack':
          return ['poisoned', 'prone', 'frightened', 'restrained'].includes(name)
        case 'check':
          return ['poisoned', 'frightened'].includes(name)
        case 'save':
          return ['restrained'].includes(name)
        default:
          return false
      }
    })

    if (hasAdvantage && hasDisadvantage) return 'normal'
    if (hasAdvantage) return 'advantage'
    if (hasDisadvantage) return 'disadvantage'
    return 'normal'
  }

  static rollD20(advantageType: 'advantage' | 'disadvantage' | 'normal' = 'normal'): number {
    const roll1 = Math.floor(Math.random() * 20) + 1
    
    if (advantageType === 'normal') {
      return roll1
    }

    const roll2 = Math.floor(Math.random() * 20) + 1
    
    return advantageType === 'advantage' 
      ? Math.max(roll1, roll2)
      : Math.min(roll1, roll2)
  }

  static rollDice(dice: string): number {
    // Parse dice notation (e.g., "2d6+3")
    const match = dice.match(/(\d+)?d(\d+)([+-]\d+)?/)
    if (!match) return 0

    const count = parseInt(match[1] || '1')
    const sides = parseInt(match[2])
    const modifier = parseInt(match[3] || '0')

    let total = 0
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1
    }

    return total + modifier
  }

  static calculateInitiative(participant: CombatParticipant): number {
    const dexMod = participant.initiative
    return this.rollD20() + dexMod
  }

  static resolveAttack(
    attacker: CombatParticipant,
    target: CombatParticipant,
    attackBonus: number,
    damageDice: string
  ): {
    hit: boolean
    damage: number
    critical: boolean
    roll: number
  } {
    const advantageType = this.calculateAdvantage(attacker, 'attack')
    const roll = this.rollD20(advantageType)
    const total = roll + attackBonus
    const critical = roll === 20
    const hit = critical || total >= target.ac

    let damage = 0
    if (hit) {
      damage = this.rollDice(damageDice)
      if (critical) {
        // On a critical hit, double the damage dice
        damage += this.rollDice(damageDice)
      }
    }

    return { hit, damage, critical, roll }
  }
}
