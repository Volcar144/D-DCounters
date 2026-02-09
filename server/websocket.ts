import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

const server = createServer()
const wss = new WebSocketServer({ server })

interface Client {
  ws: WebSocket
  encounterId?: string
  role: 'dm' | 'player'
}

const clients: Map<string, Client> = new Map()

wss.on('connection', (ws: WebSocket) => {
  const clientId = Math.random().toString(36).substr(2, 9)
  
  clients.set(clientId, { ws, role: 'player' })
  
  console.log(`Client ${clientId} connected`)

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString())
      
      switch (data.type) {
        case 'join_encounter':
          const client = clients.get(clientId)
          if (client) {
            client.encounterId = data.encounterId
            client.role = data.role || 'player'
          }
          broadcast(data.encounterId, {
            type: 'player_joined',
            clientId,
            role: data.role,
          }, clientId)
          break
          
        case 'update_encounter':
          broadcast(data.encounterId, {
            type: 'encounter_updated',
            encounter: data.encounter,
          }, clientId)
          break
          
        case 'update_participant':
          broadcast(data.encounterId, {
            type: 'participant_updated',
            participant: data.participant,
          }, clientId)
          break
          
        case 'add_log':
          broadcast(data.encounterId, {
            type: 'log_added',
            log: data.log,
          }, clientId)
          break
          
        case 'next_turn':
          broadcast(data.encounterId, {
            type: 'turn_changed',
            round: data.round,
          }, clientId)
          break
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  })

  ws.on('close', () => {
    const client = clients.get(clientId)
    if (client?.encounterId) {
      broadcast(client.encounterId, {
        type: 'player_left',
        clientId,
      }, clientId)
    }
    clients.delete(clientId)
    console.log(`Client ${clientId} disconnected`)
  })

  ws.on('error', (error) => {
    console.error(`Client ${clientId} error:`, error)
  })
})

function broadcast(encounterId: string, message: any, excludeClientId?: string) {
  clients.forEach((client, id) => {
    if (
      client.encounterId === encounterId &&
      id !== excludeClientId &&
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(JSON.stringify(message))
    }
  })
}

const PORT = process.env.WS_PORT || 3001

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})
