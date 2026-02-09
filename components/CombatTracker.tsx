'use client'

import { useState, useEffect } from 'react'
import { useCombatStore } from '@/lib/store'
import { CombatParticipant, Condition, Effect } from '@/types/combat'

function ParticipantCard({ participant }: { participant: CombatParticipant }) {
  const {
    dealDamage,
    healDamage,
    rollInitiative,
    addCondition,
    removeCondition,
    addEffect,
    isDM,
  } = useCombatStore()

  const [damageInput, setDamageInput] = useState('')
  const [healInput, setHealInput] = useState('')
  const [showActions, setShowActions] = useState(false)

  const hpPercentage = (participant.hp / participant.maxHp) * 100

  const handleRollInitiative = () => {
    const d20 = Math.floor(Math.random() * 20) + 1
    const total = d20 + participant.initiative
    rollInitiative(participant.id, total)
  }

  const handleDamage = () => {
    const amount = parseInt(damageInput)
    if (!isNaN(amount) && amount > 0) {
      dealDamage(participant.id, amount)
      setDamageInput('')
    }
  }

  const handleHeal = () => {
    const amount = parseInt(healInput)
    if (!isNaN(amount) && amount > 0) {
      healDamage(participant.id, amount)
      setHealInput('')
    }
  }

  const handleAddCondition = (name: string) => {
    const condition: Condition = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      duration: 1,
      description: name,
    }
    addCondition(participant.id, condition)
  }

  return (
    <div className={`participant-card bg-gray-700 rounded-lg p-4 ${participant.isDead ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-bold">{participant.name}</h4>
          <div className="text-sm text-gray-400">
            {participant.type} | AC: {participant.ac} | Init: {participant.initiativeRoll || '?'}
          </div>
        </div>
        {isDM && (
          <button
            onClick={() => setShowActions(!showActions)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          >
            {showActions ? 'Hide' : 'Actions'}
          </button>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>HP: {participant.hp}/{participant.maxHp}</span>
          <span>{Math.round(hpPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
          <div
            className={`hp-bar h-full ${
              hpPercentage > 50 ? 'bg-green-500' :
              hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      {participant.conditions.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold mb-1">Conditions:</div>
          <div className="flex flex-wrap gap-1">
            {participant.conditions.map((condition) => (
              <div
                key={condition.id}
                className="bg-yellow-600 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {condition.name} ({condition.duration})
                {isDM && (
                  <button
                    onClick={() => removeCondition(participant.id, condition.id)}
                    className="text-white hover:text-red-300"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {participant.effects.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold mb-1">Effects:</div>
          <div className="flex flex-wrap gap-1">
            {participant.effects.map((effect) => (
              <div
                key={effect.id}
                className={`px-2 py-1 rounded text-xs ${
                  effect.type === 'buff' ? 'bg-blue-600' :
                  effect.type === 'debuff' ? 'bg-red-600' : 'bg-purple-600'
                }`}
              >
                {effect.name} ({effect.duration})
              </div>
            ))}
          </div>
        </div>
      )}

      {isDM && showActions && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-600">
          {!participant.initiativeRoll && (
            <button
              onClick={handleRollInitiative}
              className="w-full px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Roll Initiative
            </button>
          )}
          
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Damage"
              value={damageInput}
              onChange={(e) => setDamageInput(e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm"
            />
            <button
              onClick={handleDamage}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Deal
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Healing"
              value={healInput}
              onChange={(e) => setHealInput(e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm"
            />
            <button
              onClick={handleHeal}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Heal
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {['Poisoned', 'Stunned', 'Prone', 'Blinded', 'Frightened'].map((condition) => (
              <button
                key={condition}
                onClick={() => handleAddCondition(condition)}
                className="px-2 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-600 text-xs"
              >
                + {condition}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CombatTracker() {
  const { currentEncounter, startCombat, endCombat, nextTurn, isDM } = useCombatStore()

  if (!currentEncounter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No active encounter. Create one in the Encounter Builder!</p>
      </div>
    )
  }

  const sortedParticipants = [...currentEncounter.participants]
    .sort((a, b) => (b.initiativeRoll || 0) - (a.initiativeRoll || 0))

  const currentTurnIndex = currentEncounter.round % sortedParticipants.filter(p => !p.isDead).length
  const currentParticipant = sortedParticipants.filter(p => !p.isDead)[currentTurnIndex]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{currentEncounter.name}</h2>
          <p className="text-gray-400">
            Status: <span className="capitalize">{currentEncounter.status}</span> | Round: {currentEncounter.round}
          </p>
          {currentParticipant && currentEncounter.status === 'active' && (
            <p className="text-green-400 mt-2">Current Turn: {currentParticipant.name}</p>
          )}
        </div>

        {isDM && (
          <div className="flex gap-2">
            {currentEncounter.status === 'preparing' && (
              <button
                onClick={startCombat}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Combat
              </button>
            )}
            
            {currentEncounter.status === 'active' && (
              <>
                <button
                  onClick={nextTurn}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next Turn
                </button>
                <button
                  onClick={endCombat}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  End Combat
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Initiative Order</h3>
          <div className="space-y-3">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className={`${
                  currentParticipant?.id === participant.id && currentEncounter.status === 'active'
                    ? 'ring-2 ring-green-500'
                    : ''
                }`}
              >
                <ParticipantCard participant={participant} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Combat Log</h3>
          <div className="combat-log bg-gray-700 rounded-lg p-4 space-y-2">
            {currentEncounter.logs.length === 0 ? (
              <p className="text-gray-400 text-center">No actions yet...</p>
            ) : (
              currentEncounter.logs.slice().reverse().map((log) => (
                <div key={log.id} className="text-sm border-b border-gray-600 pb-2">
                  <span className="text-gray-400">Round {log.round}</span>
                  <p>
                    <span className="font-semibold">{log.actor}</span>
                    {log.target && <span> → <span className="font-semibold">{log.target}</span></span>}
                  </p>
                  <p className="text-gray-300">
                    {log.action === 'damage' && `Dealt ${log.details.damage} damage (HP: ${log.details.newHp})`}
                    {log.action === 'heal' && `Healed ${log.details.amount} HP (HP: ${log.details.newHp})`}
                    {log.action === 'initiative' && `Rolled ${log.details.roll} for initiative`}
                    {log.action === 'condition' && `Applied condition: ${log.details.condition}`}
                  </p>
                </div>
              ))
            )}
          </div>

          {isDM && currentEncounter.status === 'active' && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-bold mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Auto-simulate AI turn
                    if (currentParticipant && !currentParticipant.isPlayer) {
                      const targets = sortedParticipants.filter(p => p.isPlayer && !p.isDead)
                      if (targets.length > 0) {
                        const target = targets[Math.floor(Math.random() * targets.length)]
                        const damage = Math.floor(Math.random() * 10) + 1
                        alert(`${currentParticipant.name} attacks ${target.name} for ${damage} damage!`)
                      }
                    }
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  🤖 AI Auto-Simulate Turn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
