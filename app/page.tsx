'use client'

import { useState, useEffect } from 'react'
import EncounterBuilder from '@/components/EncounterBuilder'
import CombatTracker from '@/components/CombatTracker'
import MonsterDatabase from '@/components/MonsterDatabase'
import { useCombatStore } from '@/lib/store'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'builder' | 'combat' | 'monsters'>('builder')
  const { currentEncounter, isDM, setIsDM, isConnected } = useCombatStore()
  const { sendMessage } = useWebSocket(currentEncounter?.id)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}/>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-10 fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎲</div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-orange-500 bg-clip-text text-transparent">
                  D&D Encounters
                </h1>
                <p className="text-gray-400 text-sm mt-1">Combat Tracker & Encounter Builder</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-center flex-wrap">
              {/* Connection Status */}
              <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="text-sm text-gray-300">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>

              {/* DM Mode Toggle */}
              <label className="glass-card px-4 py-2 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isDM}
                  onChange={(e) => setIsDM(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <span className="text-white font-medium">DM Mode</span>
                <span className="text-xs text-gray-400">
                  {isDM ? '🎭' : '⚔️'}
                </span>
              </label>

              {/* Current Encounter Badge */}
              {currentEncounter && (
                <div className="glass-card px-5 py-2 rounded-lg border-l-4 border-red-500 animate-slideIn">
                  <div className="text-xs text-gray-400">Active Encounter</div>
                  <div className="text-white font-semibold">{currentEncounter.name}</div>
                  <div className="text-xs text-gray-400">Round {currentEncounter.round}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="mb-8 fade-in">
          <div className="glass-card rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('builder')}
              className={`tab-button px-6 py-3 rounded-md font-semibold transition-all flex-1 ${
                activeTab === 'builder'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">⚔️</span>
              Encounter Builder
            </button>
            <button
              onClick={() => setActiveTab('combat')}
              className={`tab-button px-6 py-3 rounded-md font-semibold transition-all flex-1 ${
                activeTab === 'combat'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">⚡</span>
              Combat Tracker
            </button>
            <button
              onClick={() => setActiveTab('monsters')}
              className={`tab-button px-6 py-3 rounded-md font-semibold transition-all flex-1 ${
                activeTab === 'monsters'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">🐉</span>
              Monster Database
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="glass-card rounded-xl shadow-2xl p-8 backdrop-blur-sm border border-gray-700/50 fade-in">
          {activeTab === 'builder' && <EncounterBuilder />}
          {activeTab === 'combat' && <CombatTracker />}
          {activeTab === 'monsters' && <MonsterDatabase />}
        </div>
      </div>
    </main>
  )
}
