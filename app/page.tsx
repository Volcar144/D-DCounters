'use client'

import { useState } from 'react'
import EncounterBuilder from '@/components/EncounterBuilder'
import CombatTracker from '@/components/CombatTracker'
import MonsterDatabase from '@/components/MonsterDatabase'
import { useCombatStore } from '@/lib/store'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'builder' | 'combat' | 'monsters'>('builder')
  const { currentEncounter, isDM, setIsDM } = useCombatStore()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-red-500">🎲 D&D Encounters</h1>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isDM}
                  onChange={(e) => setIsDM(e.target.checked)}
                  className="w-4 h-4"
                />
                DM Mode
              </label>
              {currentEncounter && (
                <div className="text-white bg-gray-700 px-4 py-2 rounded">
                  {currentEncounter.name} - Round {currentEncounter.round}
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="mb-6">
          <div className="flex gap-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'builder'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Encounter Builder
            </button>
            <button
              onClick={() => setActiveTab('combat')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'combat'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Combat Tracker
            </button>
            <button
              onClick={() => setActiveTab('monsters')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'monsters'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monster Database
            </button>
          </div>
        </nav>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          {activeTab === 'builder' && <EncounterBuilder />}
          {activeTab === 'combat' && <CombatTracker />}
          {activeTab === 'monsters' && <MonsterDatabase />}
        </div>
      </div>
    </main>
  )
}
