import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId = 'demo-user-id', 
      name, 
      details = '', 
      aspirations = '', 
      strengths = '', 
      weaknesses = '',
      weight = '',
      height = '',
      fitnessGoals = '',
      executionBase = 5,
      adaptabilityBase = 5,
      resilienceBase = 5,
      selfAwarenessBase = 5,
      egoResistanceBase = 5
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 })
    }

    // Combine physical details into details for System AI prompt
    const enhancedDetails = `${details}. Physical profile: Height: ${height || 'Not set'}, Weight: ${weight || 'Not set'}, Goals: ${fitnessGoals || 'Not set'}.`

    // Call System AI to compile character sheet
    const systemResponse = await SystemAI.generateCharacter(name, enhancedDetails, aspirations, strengths, weaknesses)

    // Check if character already exists for user
    const existingChar = await prisma.character.findUnique({
      where: { user_id: userId }
    })

    // Prepare default avatar URL
    const seed = encodeURIComponent(systemResponse.class)
    const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/png?seed=${seed}&backgroundColor=0f172a`

    let character
    if (existingChar) {
      // Update existing
      character = await prisma.character.update({
        where: { user_id: userId },
        data: {
          name,
          class: systemResponse.class,
          origin_story: systemResponse.biography,
          avatar_url: avatarUrl,
          weight: weight || null,
          height: height || null,
          fitness_goals: fitnessGoals || null,
          execution_base: executionBase,
          execution_lvl: executionBase,
          adaptability_base: adaptabilityBase,
          adaptability_lvl: adaptabilityBase,
          resilience_base: resilienceBase,
          resilience_lvl: resilienceBase,
          self_awareness_base: selfAwarenessBase,
          self_awareness_lvl: selfAwarenessBase,
          ego_resistance_base: egoResistanceBase,
          ego_resistance_lvl: egoResistanceBase
        }
      })
    } else {
      // Create new character
      character = await prisma.character.create({
        data: {
          user_id: userId,
          name,
          class: systemResponse.class,
          origin_story: systemResponse.biography,
          avatar_url: avatarUrl,
          current_rank: 'E',
          weight: weight || null,
          height: height || null,
          fitness_goals: fitnessGoals || null,
          execution_base: executionBase,
          execution_lvl: executionBase,
          adaptability_base: adaptabilityBase,
          adaptability_lvl: adaptabilityBase,
          resilience_base: resilienceBase,
          resilience_lvl: resilienceBase,
          self_awareness_base: selfAwarenessBase,
          self_awareness_lvl: selfAwarenessBase,
          ego_resistance_base: egoResistanceBase,
          ego_resistance_lvl: egoResistanceBase
        }
      })
    }

    // Save initial CharacterSnapshot
    const snapshot = await prisma.characterSnapshot.create({
      data: {
        character_id: character.id,
        avatar_url: avatarUrl,
        rank: 'E',
        level: 1,
        title: 'Wanderer',
        narrative: systemResponse.biography,
        weight: weight || null,
        height: height || null,
        execution_lvl: executionBase,
        adaptability_lvl: adaptabilityBase,
        resilience_lvl: resilienceBase,
        self_awareness_lvl: selfAwarenessBase,
        ego_resistance_lvl: egoResistanceBase
      }
    })

    // Save starting skills
    if (systemResponse.initialSkills && Array.isArray(systemResponse.initialSkills)) {
      for (const sk of systemResponse.initialSkills) {
        try {
          const existSkill = await prisma.skill.findFirst({
            where: { user_id: userId, name: sk.name }
          })
          if (!existSkill) {
            await prisma.skill.create({
              data: {
                user_id: userId,
                name: sk.name,
                category: sk.category,
                description: sk.description,
                xp: 0,
                level: 1
              }
            })
          }
        } catch (e) {
          console.error('Failed to create starting skill:', sk.name, e)
        }
      }
    }

    // Save starting quests
    if (systemResponse.initialQuests && Array.isArray(systemResponse.initialQuests)) {
      for (const q of systemResponse.initialQuests) {
        try {
          await prisma.quest.create({
            data: {
              user_id: userId,
              title: q.title,
              description: q.description,
              quest_type: q.quest_type,
              difficulty: q.difficulty,
              xp_reward: q.xp_reward,
              status: 'ACTIVE'
            }
          })
        } catch (e) {
          console.error('Failed to create starting quest:', q.title, e)
        }
      }
    }

    // Also update global user title to Wanderer if not set
    await prisma.user.update({
      where: { id: userId },
      data: { current_title: 'Wanderer' }
    })

    return NextResponse.json({ character, snapshot, aiGeneration: systemResponse })
  } catch (error: any) {
    console.error('Character Creation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
