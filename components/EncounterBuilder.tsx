'use client'

import { useState, useEffect } from 'react'
import { useCombatStore } from '@/lib/store'
import { CombatParticipant } from '@/types/combat'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableParticipant({ participant, onRemove }: { 
  participant: CombatParticipant
  onRemove: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: participant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="participant-card p-4 rounded-lg flex items-center justify-between cursor-move mb-3 hover:shadow-xl"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="text-3xl">
          {participant.type === 'monster' ? '🐉' : participant.type === 'character' ? '⚔️' : '🧙'}
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg text-white">{participant.name}</div>
          <div className="text-sm text-gray-400 flex gap-4 mt-1">
            <span className="capitalize">{participant.type}</span>
            <span>❤️ {participant.hp}/{participant.maxHp}</span>
            <span>🛡️ {participant.ac}</span>
            <span>⚡ +{participant.initiative}</span>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(participant.id)
        }}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
      >
        ✕ Remove
      </button>
    </div>
  )
}

export default function EncounterBuilder() {
  const { setEncounter } = useCombatStore()
  const [encounterName, setEncounterName] = useState('New Encounter')
  const [participants, setParticipants] = useState<CombatParticipant[]>([])
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    type: 'monster' as 'character' | 'monster' | 'npc',
    hp: 10,
    maxHp: 10,
    ac: 10,
    initiative: 0,
    isPlayer: false,
  })

  const addParticipant = () => {
    if (!newParticipant.name.trim()) return

    const participant: CombatParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      ...newParticipant,
      conditions: [],
      effects: [],
      isDead: false,
    }

    setParticipants([...participants, participant])
    setNewParticipant({
      name: '',
      type: 'monster',
      hp: 10,
      maxHp: 10,
      ac: 10,
      initiative: 0,
      isPlayer: false,
    })
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setParticipants((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const startEncounter = () => {
    const encounter = {
      id: Math.random().toString(36).substr(2, 9),
      name: encounterName,
      status: 'preparing' as const,
      round: 0,
      participants,
      logs: [],
    }
    setEncounter(encounter)
  }

  const saveEncounter = async () => {
    try {
      const response = await fetch('/api/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: encounterName,
          participants,
        }),
      })
      
      if (response.ok) {
        alert('Encounter saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save encounter:', error)
      alert('Failed to save encounter')
    }
  }

  const loadEncounters = async () => {
    try {
      const response = await fetch('/api/encounters')
      const data = await response.json()
      console.log('Loaded encounters:', data)
      // You can implement a modal to select from loaded encounters
    } catch (error) {
      console.error('Failed to load encounters:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="glass-card p-6 rounded-lg space-y-4">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-semibold mb-2 text-gray-300">📝 Encounter Name</label>
            <input
              type="text"
              value={encounterName}
              onChange={(e) => setEncounterName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Enter encounter name..."
            />
          </div>
          <button
            onClick={startEncounter}
            disabled={participants.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
          >
            ▶️ Start Encounter
          </button>
          <button
            onClick={saveEncounter}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
          >
            💾 Save
          </button>
          <button
            onClick={loadEncounters}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg"
          >
            📂 Load
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add Participant Form */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">➕</span>
            <h3 className="text-2xl font-bold text-white">Add Participant</h3>
          </div>
          
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Name</label>
              <input
                type="text"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Enter participant name..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Type</label>
                <select
                  value={newParticipant.type}
                  onChange={(e) => setNewParticipant({ ...newParticipant, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                >
                  <option value="character">⚔️ Character</option>
                  <option value="monster">🐉 Monster</option>
                  <option value="npc">🧙 NPC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">❤️ HP</label>
                <input
                  type="number"
                  value={newParticipant.hp}
                  onChange={(e) => {
                    const hp = parseInt(e.target.value) || 10
                    setNewParticipant({ ...newParticipant, hp, maxHp: hp })
                  }}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">🛡️ AC</label>
                <input
                  type="number"
                  value={newParticipant.ac}
                  onChange={(e) => setNewParticipant({ ...newParticipant, ac: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">⚡ Initiative Mod</label>
                <input
                  type="number"
                  value={newParticipant.initiative}
                  onChange={(e) => setNewParticipant({ ...newParticipant, initiative: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newParticipant.isPlayer}
                  onChange={(e) => setNewParticipant({ ...newParticipant, isPlayer: e.target.checked })}
                  className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <span className="text-white font-medium group-hover:text-red-400 transition-colors">Player Character</span>
              </label>
            </div>

            <button
              onClick={addParticipant}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold text-lg shadow-lg"
            >
              ➕ Add to Encounter
            </button>
          </div>
        </div>

        {/* Participants List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">👥</span>
            <h3 className="text-2xl font-bold text-white">Participants ({participants.length})</h3>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={participants} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {participants.map((participant) => (
                    <SortableParticipant
                      key={participant.id}
                      participant={participant}
                      onRemove={removeParticipant}
                    />
                  ))}
                  {participants.length === 0 && (
                    <div className="text-center py-16 px-4">
                      <div className="text-6xl mb-4">🎲</div>
                      <p className="text-gray-400 text-lg">
                        No participants yet.
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Add characters and monsters to build your encounter!
                      </p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  )
}
