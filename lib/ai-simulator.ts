import { CombatParticipant } from '@/types/combat'
import { RuleEngine } from './rule-engine'

export class AISimulator {
  static selectTarget(
    actor: CombatParticipant,
    participants: CombatParticipant[]
  ): CombatParticipant | null {
    // Filter out dead participants and the actor itself
    const validTargets = participants.filter(
      p => !p.isDead && p.id !== actor.id && p.isPlayer !== actor.isPlayer
    )

    if (validTargets.length === 0) return null

    // Simple AI: Target the enemy with the lowest HP percentage
    const sortedTargets = validTargets.sort((a, b) => {
      const aHpPercent = a.hp / a.maxHp
      const bHpPercent = b.hp / b.maxHp
      return aHpPercent - bHpPercent
    })

    return sortedTargets[0]
  }

  static selectAction(actor: CombatParticipant, target: CombatParticipant): {
    action: string
    description: string
  } {
    // Check if actor can perform actions (not stunned, paralyzed, etc.)
    const incapacitatedConditions = ['stunned', 'paralyzed', 'unconscious']
    const isIncapacitated = actor.conditions.some(c =>
      incapacitatedConditions.includes(c.name.toLowerCase())
    )

    if (isIncapacitated) {
      return {
        action: 'skip',
        description: `${actor.name} is incapacitated and cannot act.`,
      }
    }

    // Simple AI decision tree
    const hpPercent = actor.hp / actor.maxHp

    // If low on health, try to disengage or defend
    if (hpPercent < 0.3) {
      if (Math.random() < 0.5) {
        return {
          action: 'dodge',
          description: `${actor.name} takes the Dodge action defensively.`,
        }
      }
    }

    // Default: Attack the target
    return {
      action: 'attack',
      description: `${actor.name} attacks ${target.name}!`,
    }
  }

  static async simulateTurn(
    actor: CombatParticipant,
    participants: CombatParticipant[]
  ): Promise<{
    logs: string[]
    updates: Array<{ id: string; updates: Partial<CombatParticipant> }>
  }> {
    const logs: string[] = []
    const updates: Array<{ id: string; updates: Partial<CombatParticipant> }> = []

    // Select a target
    const target = this.selectTarget(actor, participants)
    if (!target) {
      logs.push(`${actor.name} has no valid targets.`)
      return { logs, updates }
    }

    // Select an action
    const { action, description } = this.selectAction(actor, target)
    logs.push(description)

    if (action === 'attack') {
      // Simulate an attack
      const attackBonus = Math.floor((actor.initiative + 2) / 2) // Simplified
      const damageDice = '1d8+2' // Simplified

      const result = RuleEngine.resolveAttack(actor, target, attackBonus, damageDice)

      if (result.hit) {
        const newHp = Math.max(0, target.hp - result.damage)
        const isDead = newHp === 0

        logs.push(
          `${actor.name} rolled ${result.roll} + ${attackBonus} = ${result.roll + attackBonus} vs AC ${target.ac}`
        )
        logs.push(
          `${result.critical ? 'Critical hit! ' : ''}Hit for ${result.damage} damage! ${target.name} now has ${newHp}/${target.maxHp} HP.`
        )

        if (isDead) {
          logs.push(`💀 ${target.name} has been defeated!`)
        }

        updates.push({
          id: target.id,
          updates: { hp: newHp, isDead },
        })
      } else {
        logs.push(
          `${actor.name} rolled ${result.roll} + ${attackBonus} = ${result.roll + attackBonus} vs AC ${target.ac} - Miss!`
        )
      }
    } else if (action === 'dodge') {
      // Apply dodge effect (would need to be implemented in the effect system)
      logs.push(`${actor.name} is harder to hit until their next turn.`)
    }

    return { logs, updates }
  }

  static async simulateRound(
    participants: CombatParticipant[],
    round: number
  ): Promise<{
    logs: string[]
    updates: Array<{ id: string; updates: Partial<CombatParticipant> }>
  }> {
    const allLogs: string[] = [`--- Round ${round} ---`]
    const allUpdates: Array<{ id: string; updates: Partial<CombatParticipant> }> = []

    // Sort by initiative
    const sortedParticipants = [...participants]
      .filter(p => !p.isDead)
      .sort((a, b) => (b.initiativeRoll || 0) - (a.initiativeRoll || 0))

    for (const participant of sortedParticipants) {
      // Only simulate AI turns (non-player characters)
      if (!participant.isPlayer) {
        const { logs, updates } = await this.simulateTurn(participant, participants)
        allLogs.push(...logs)
        allUpdates.push(...updates)
      } else {
        allLogs.push(`${participant.name}'s turn (player controlled)`)
      }
    }

    return { logs: allLogs, updates: allUpdates }
  }

  static calculateEncounterDifficulty(
    participants: CombatParticipant[]
  ): {
    difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly'
    playerPower: number
    enemyPower: number
  } {
    const players = participants.filter(p => p.isPlayer)
    const enemies = participants.filter(p => !p.isPlayer)

    const playerPower = players.reduce((sum, p) => sum + p.maxHp + p.ac, 0)
    const enemyPower = enemies.reduce((sum, p) => sum + p.maxHp + p.ac, 0)

    const ratio = enemyPower / playerPower

    let difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly'
    if (ratio < 0.5) difficulty = 'trivial'
    else if (ratio < 0.75) difficulty = 'easy'
    else if (ratio < 1.0) difficulty = 'medium'
    else if (ratio < 1.5) difficulty = 'hard'
    else difficulty = 'deadly'

    return { difficulty, playerPower, enemyPower }
  }
}
