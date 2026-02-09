import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const encounters = await prisma.encounter.findMany({
      include: {
        participants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(encounters)
  } catch (error) {
    console.error('Error fetching encounters:', error)
    return NextResponse.json({ error: 'Failed to fetch encounters' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, difficulty, participants } = body

    const encounter = await prisma.encounter.create({
      data: {
        name,
        description,
        difficulty,
        participants: {
          create: participants.map((p: any) => ({
            name: p.name,
            type: p.type,
            hp: p.hp,
            maxHp: p.maxHp,
            ac: p.ac,
            initiative: p.initiative,
            isPlayer: p.isPlayer,
            conditions: JSON.stringify(p.conditions || []),
            effects: JSON.stringify(p.effects || []),
            monsterData: p.monsterData ? JSON.stringify(p.monsterData) : null,
          })),
        },
      },
      include: {
        participants: true,
      },
    })

    return NextResponse.json(encounter)
  } catch (error) {
    console.error('Error creating encounter:', error)
    return NextResponse.json({ error: 'Failed to create encounter' }, { status: 500 })
  }
}
