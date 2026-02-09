'use client'

import { useState, useEffect } from 'react'
import { Monster5e, getMonsters, getMonster } from '@/lib/dnd-api'

export default function MonsterDatabase() {
  const [monsters, setMonsters] = useState<Monster5e[]>([])
  const [selectedMonster, setSelectedMonster] = useState<Monster5e | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMonsters()
  }, [])

  const loadMonsters = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMonsters()
      setMonsters(data.monsters)
    } catch (err) {
      console.error('Error loading monsters:', err)
      setError('Failed to load monsters from API. Using sample data.')
      // Fallback sample data
      setMonsters([
        {
          index: 'goblin',
          name: 'Goblin',
          type: 'humanoid',
          challenge_rating: 0.25,
          hit_points: 7,
          armor_class: [{ value: 15 }],
          speed: { walk: '30 ft.' },
          strength: 8,
          dexterity: 14,
          constitution: 10,
          intelligence: 10,
          wisdom: 8,
          charisma: 8,
          special_abilities: [],
          actions: [],
        },
        {
          index: 'orc',
          name: 'Orc',
          type: 'humanoid',
          challenge_rating: 0.5,
          hit_points: 15,
          armor_class: [{ value: 13 }],
          speed: { walk: '30 ft.' },
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 7,
          wisdom: 11,
          charisma: 10,
          special_abilities: [],
          actions: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const selectMonster = async (index: string) => {
    try {
      const data = await getMonster(index)
      setSelectedMonster(data.monster)
    } catch (err) {
      console.error('Error loading monster details:', err)
      const monster = monsters.find(m => m.index === index)
      if (monster) {
        setSelectedMonster(monster)
      }
    }
  }

  const filteredMonsters = monsters.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToEncounter = (monster: Monster5e) => {
    // This would integrate with the encounter builder
    alert(`${monster.name} would be added to the current encounter!`)
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search monsters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded text-white"
          />
        </div>

        {loading && <p className="text-gray-400">Loading monsters...</p>}
        {error && <p className="text-yellow-400 text-sm">{error}</p>}

        <div className="space-y-2 max-h-[700px] overflow-y-auto">
          {filteredMonsters.map((monster) => (
            <div
              key={monster.index}
              onClick={() => selectMonster(monster.index)}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedMonster?.index === monster.index
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="font-bold">{monster.name}</div>
              <div className="text-sm text-gray-400">
                CR {monster.challenge_rating} | {monster.type}
              </div>
            </div>
          ))}
          {filteredMonsters.length === 0 && !loading && (
            <p className="text-gray-400 text-center py-4">No monsters found</p>
          )}
        </div>
      </div>

      <div className="col-span-2">
        {selectedMonster ? (
          <div className="bg-gray-700 rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedMonster.name}</h2>
                <p className="text-gray-400 capitalize">{selectedMonster.type}</p>
              </div>
              <button
                onClick={() => addToEncounter(selectedMonster)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add to Encounter
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-600">
              <div>
                <div className="text-sm text-gray-400">Challenge Rating</div>
                <div className="text-2xl font-bold">{selectedMonster.challenge_rating}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Hit Points</div>
                <div className="text-2xl font-bold">{selectedMonster.hit_points}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Armor Class</div>
                <div className="text-2xl font-bold">
                  {selectedMonster.armor_class[0]?.value || 10}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Abilities</h3>
              <div className="grid grid-cols-6 gap-2">
                <div className="text-center p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">STR</div>
                  <div className="font-bold">{selectedMonster.strength}</div>
                  <div className="text-xs">
                    ({Math.floor((selectedMonster.strength - 10) / 2) >= 0 ? '+' : ''}
                    {Math.floor((selectedMonster.strength - 10) / 2)})
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">DEX</div>
                  <div className="font-bold">{selectedMonster.dexterity}</div>
                  <div className="text-xs">
                    ({Math.floor((selectedMonster.dexterity - 10) / 2) >= 0 ? '+' : ''}
                    {Math.floor((selectedMonster.dexterity - 10) / 2)})
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">CON</div>
                  <div className="font-bold">{selectedMonster.constitution}</div>
                  <div className="text-xs">
                    ({Math.floor((selectedMonster.constitution - 10) / 2) >= 0 ? '+' : ''}
                    {Math.floor((selectedMonster.constitution - 10) / 2)})
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">INT</div>
                  <div className="font-bold">{selectedMonster.intelligence}</div>
                  <div className="text-xs">
                    ({Math.floor((selectedMonster.intelligence - 10) / 2) >= 0 ? '+' : ''}
                    {Math.floor((selectedMonster.intelligence - 10) / 2)})
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">WIS</div>
                  <div className="font-bold">{selectedMonster.wisdom}</div>
                  <div className="text-xs">
                    ({Math.floor((selectedMonster.wisdom - 10) / 2) >= 0 ? '+' : ''}
                    {Math.floor((selectedMonster.wisdom - 10) / 2)})
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">CHA</div>
                  <div className="font-bold">{selectedMonster.charisma}</div>
                  <div className="text-xs">
                    ({Math.floor((selectedMonster.charisma - 10) / 2) >= 0 ? '+' : ''}
                    {Math.floor((selectedMonster.charisma - 10) / 2)})
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Speed</h3>
              <div className="flex gap-4 text-sm">
                {selectedMonster.speed.walk && (
                  <div>Walk: <span className="font-semibold">{selectedMonster.speed.walk}</span></div>
                )}
                {selectedMonster.speed.fly && (
                  <div>Fly: <span className="font-semibold">{selectedMonster.speed.fly}</span></div>
                )}
                {selectedMonster.speed.swim && (
                  <div>Swim: <span className="font-semibold">{selectedMonster.speed.swim}</span></div>
                )}
              </div>
            </div>

            {selectedMonster.special_abilities && selectedMonster.special_abilities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-2">Special Abilities</h3>
                <div className="space-y-2">
                  {selectedMonster.special_abilities.map((ability, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded">
                      <div className="font-bold">{ability.name}</div>
                      <div className="text-sm text-gray-300">{ability.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMonster.actions && selectedMonster.actions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-2">Actions</h3>
                <div className="space-y-2">
                  {selectedMonster.actions.map((action, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded">
                      <div className="font-bold flex items-center gap-2">
                        {action.name}
                        {action.attack_bonus && (
                          <span className="text-sm text-gray-400">
                            +{action.attack_bonus} to hit
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">{action.desc}</div>
                      {action.damage && action.damage.length > 0 && (
                        <div className="text-sm text-red-400 mt-1">
                          {action.damage.map((d, i) => (
                            <span key={i}>
                              {d.damage_dice} {d.damage_type.name}
                              {i < (action.damage?.length || 0) - 1 ? ' + ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">Select a monster to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
