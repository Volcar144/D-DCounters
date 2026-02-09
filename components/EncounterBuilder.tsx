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
      className="bg-gray-700 p-4 rounded flex items-center justify-between cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="flex-1">
        <div className="font-bold">{participant.name}</div>
        <div className="text-sm text-gray-400">
          {participant.type} | HP: {participant.hp}/{participant.maxHp} | AC: {participant.ac} | Init: +{participant.initiative}
        </div>
      </div>
      <button
        onClick={() => onRemove(participant.id)}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Remove
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
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Encounter Name</label>
          <input
            type="text"
            value={encounterName}
            onChange={(e) => setEncounterName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded text-white"
          />
        </div>
        <button
          onClick={startEncounter}
          disabled={participants.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Start Encounter
        </button>
        <button
          onClick={saveEncounter}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={loadEncounters}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Load
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Add Participant</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={newParticipant.name}
              onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded text-white"
              placeholder="Participant name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={newParticipant.type}
                onChange={(e) => setNewParticipant({ ...newParticipant, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-gray-700 rounded text-white"
              >
                <option value="character">Character</option>
                <option value="monster">Monster</option>
                <option value="npc">NPC</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">HP</label>
              <input
                type="number"
                value={newParticipant.hp}
                onChange={(e) => {
                  const hp = parseInt(e.target.value)
                  setNewParticipant({ ...newParticipant, hp, maxHp: hp })
                }}
                className="w-full px-4 py-2 bg-gray-700 rounded text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">AC</label>
              <input
                type="number"
                value={newParticipant.ac}
                onChange={(e) => setNewParticipant({ ...newParticipant, ac: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Initiative Mod</label>
              <input
                type="number"
                value={newParticipant.initiative}
                onChange={(e) => setNewParticipant({ ...newParticipant, initiative: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 rounded text-white"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newParticipant.isPlayer}
                onChange={(e) => setNewParticipant({ ...newParticipant, isPlayer: e.target.checked })}
                className="w-4 h-4"
              />
              Player Character
            </label>
          </div>

          <button
            onClick={addParticipant}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add to Encounter
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Participants ({participants.length})</h3>
          
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={participants} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {participants.map((participant) => (
                  <SortableParticipant
                    key={participant.id}
                    participant={participant}
                    onRemove={removeParticipant}
                  />
                ))}
                {participants.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No participants added yet. Add some to start building your encounter!
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
}
