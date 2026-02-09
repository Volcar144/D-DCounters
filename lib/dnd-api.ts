import { GraphQLClient, gql } from 'graphql-request'

const endpoint = 'https://www.dnd5eapi.co/graphql'
const client = new GraphQLClient(endpoint)

export interface Monster5e {
  index: string
  name: string
  type: string
  challenge_rating: number
  hit_points: number
  armor_class: Array<{ value: number }>
  speed: {
    walk?: string
    fly?: string
    swim?: string
    burrow?: string
  }
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  special_abilities: Array<{
    name: string
    desc: string
  }>
  actions: Array<{
    name: string
    desc: string
    attack_bonus?: number
    damage?: Array<{
      damage_type: { name: string }
      damage_dice: string
    }>
  }>
}

const MONSTERS_QUERY = gql`
  query GetMonsters {
    monsters {
      index
      name
      type
      challenge_rating
      hit_points
      armor_class {
        value
      }
      speed {
        walk
        fly
        swim
        burrow
      }
      strength
      dexterity
      constitution
      intelligence
      wisdom
      charisma
    }
  }
`

const MONSTER_QUERY = gql`
  query GetMonster($index: String!) {
    monster(index: $index) {
      index
      name
      type
      challenge_rating
      hit_points
      armor_class {
        value
      }
      speed {
        walk
        fly
        swim
        burrow
      }
      strength
      dexterity
      constitution
      intelligence
      wisdom
      charisma
      special_abilities {
        name
        desc
      }
      actions {
        name
        desc
        attack_bonus
        damage {
          damage_type {
            name
          }
          damage_dice
        }
      }
    }
  }
`

export async function getMonsters(): Promise<{ monsters: Monster5e[] }> {
  return client.request(MONSTERS_QUERY)
}

export async function getMonster(index: string): Promise<{ monster: Monster5e }> {
  return client.request(MONSTER_QUERY, { index })
}
