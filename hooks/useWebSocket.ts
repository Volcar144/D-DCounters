import { useEffect, useRef, useCallback } from 'react'
import { useCombatStore } from '../lib/store'

export function useWebSocket(encounterId?: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const { setConnected } = useCombatStore()

  const connect = useCallback(() => {
    if (!encounterId) return

    try {
      const ws = new WebSocket('ws://localhost:3001')
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        
        ws.send(JSON.stringify({
          type: 'join_encounter',
          encounterId,
          role: 'dm'
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message:', data)
          
          switch (data.type) {
            case 'player_joined':
              console.log(`Player ${data.clientId} joined as ${data.role}`)
              break
            case 'encounter_updated':
              if (data.encounter) {
                useCombatStore.getState().setEncounter(data.encounter)
              }
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnected(false)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      setConnected(false)
    }
  }, [encounterId, setConnected])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    if (encounterId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [encounterId, connect, disconnect])

  return {
    sendMessage,
    connected: wsRef.current?.readyState === WebSocket.OPEN
  }
}
