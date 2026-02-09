# D&D Encounters - Combat Tracker

A comprehensive D&D 5e combat encounter tracker built with Next.js, featuring real-time multiplayer support, AI auto-simulation, and an extensive monster database.

![D&D Encounters Screenshot](https://github.com/user-attachments/assets/9651a658-b995-4db8-91cc-b7872f9ecbd5)

## Features

### ✨ Core Features
- **Encounter Builder**: Create and customize combat encounters with drag-and-drop functionality
- **Combat Tracker**: Real-time initiative tracking, HP management, conditions, and effects
- **Monster Database**: Browse and search D&D 5e SRD monsters via GraphQL API
- **DM/Player Views**: Toggle between Dungeon Master and player perspectives
- **Combat Log**: Comprehensive action logging for every combat event
- **Save/Load Encounters**: Persist encounters to database for later use

### 🎮 Advanced Features
- **Initiative System**: Automatic initiative rolls with modifiers
- **Condition Tracking**: Track status conditions (Poisoned, Stunned, Prone, Blinded, Frightened, etc.)
- **Effect Management**: Apply buffs, debuffs, damage over time, and healing effects
- **HP Tracking**: Visual HP bars with automatic death detection
- **AI Auto-Simulation**: Let AI control enemy turns automatically
- **Rule Engine**: D&D 5e rule implementation for advantage/disadvantage, critical hits, damage rolls
- **Real-time Multiplayer**: WebSocket support for synchronized combat sessions (ready for implementation)

### 🎲 Rule Engine
- Advantage/Disadvantage calculation based on conditions
- Critical hit detection and damage doubling
- Dice rolling with standard notation (e.g., 2d6+3)
- Attack resolution against AC
- Condition effects on ability checks and saves

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: SQLite with Prisma ORM
- **Drag & Drop**: @dnd-kit
- **Real-time**: WebSockets (ws)
- **API Integration**: GraphQL (D&D 5e API)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Volcar144/D-DCounters.git
cd D-DCounters
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Optional: WebSocket Server

To enable real-time multiplayer features, run the WebSocket server in a separate terminal:

```bash
npm run dev:ws
```

The WebSocket server will run on port 3001 by default.

## Usage Guide

### Creating an Encounter

1. Navigate to the **Encounter Builder** tab
2. Give your encounter a name
3. Add participants by filling in their details:
   - Name
   - Type (Character/Monster/NPC)
   - HP and Max HP
   - Armor Class (AC)
   - Initiative Modifier
   - Check "Player Character" if it's a PC
4. Click "Add to Encounter"
5. Drag and drop to reorder participants
6. Click "Start Encounter" when ready

### Running Combat

1. Navigate to the **Combat Tracker** tab
2. Click "Roll Initiative" for each participant (or do it manually)
3. Click "Start Combat" to begin
4. Use the action panel for each participant to:
   - Deal damage
   - Heal HP
   - Apply conditions
5. Click "Next Turn" to advance to the next combatant
6. Use "AI Auto-Simulate Turn" for quick enemy actions
7. Click "End Combat" when finished

### Monster Database

1. Navigate to the **Monster Database** tab
2. Search for monsters by name or type
3. Click on a monster to view detailed stats
4. Click "Add to Encounter" to add the monster to your current encounter

### DM vs Player Mode

Toggle the "DM Mode" checkbox in the header to switch between views:
- **DM Mode**: Full control over all participants, can see all stats
- **Player Mode**: Limited view, only sees public information

## Project Structure

```
D-DCounters/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── encounters/    # Encounter CRUD endpoints
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page with tabs
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── EncounterBuilder.tsx
│   ├── CombatTracker.tsx
│   └── MonsterDatabase.tsx
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── store.ts          # Zustand state management
│   ├── dnd-api.ts        # D&D 5e API integration
│   ├── rule-engine.ts    # D&D 5e rules implementation
│   └── ai-simulator.ts   # AI combat simulation
├── server/               # Backend services
│   └── websocket.ts     # WebSocket server
├── types/               # TypeScript type definitions
│   └── combat.ts
├── prisma/              # Database schema and migrations
│   └── schema.prisma
└── package.json
```

## Database Schema

The application uses the following main models:

- **Encounter**: Stores encounter metadata and status
- **EncounterParticipant**: Tracks individual combatants
- **Character**: Player character definitions
- **Monster**: Cached monster data from API
- **CombatLog**: Action history for encounters

## API Integration

The application integrates with the [D&D 5e API](https://www.dnd5eapi.co/) via GraphQL to fetch:
- Monster statistics
- Ability scores
- Actions and special abilities
- Challenge ratings

If the API is unavailable, the app falls back to sample data.

## Development

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

### Database Management
```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio
npx prisma studio
```

## Future Enhancements

- [ ] Full WebSocket multiplayer implementation
- [ ] User authentication and session management
- [ ] Spell database and spell slot tracking
- [ ] Character sheet creation and management
- [ ] Campaign management
- [ ] Custom monster creation
- [ ] Export encounters to PDF
- [ ] Mobile app version
- [ ] Voice chat integration
- [ ] Map/grid support for tactical combat
- [ ] Loot generation and inventory management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- D&D 5e SRD content via [D&D 5e API](https://www.dnd5eapi.co/)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

## Screenshots

### Encounter Builder
![Encounter Builder](https://github.com/user-attachments/assets/9651a658-b995-4db8-91cc-b7872f9ecbd5)

### Combat Tracker
![Combat Tracker](https://github.com/user-attachments/assets/b4aebc47-483a-4263-8ae7-faa2a3b21dfc)

### Monster Database
![Monster Database](https://github.com/user-attachments/assets/d06adb5c-b5d1-4de1-8e2d-3ed67b611b59)

---

**Happy Gaming! 🎲**