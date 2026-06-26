import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const bossBattles = await prisma.bossBattle.findMany({
      where: { userId },
      include: {
        phases: true,
        archiveChapter: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ bossBattles })
  } catch (error: any) {
    console.error('List Boss Battles Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId = 'demo-user-id',
      title,
      description,
      epicManifesto = '',
      timeLimitHours = 168,
      estHours = 10,
      dependencies = 0,
      phases = [],
      originSource = 'USER_DECLARATION'
    } = body

    if (!title || !phases || phases.length === 0) {
      return NextResponse.json({ error: 'Title and phases are required' }, { status: 400 })
    }

    // Get user character stats for engine estimation
    const character = await prisma.character.findUnique({
      where: { user_id: userId }
    })

    let currentEnergy = 70
    let attributesReadiness = 70
    if (character) {
      try {
        const state = JSON.parse(character.state_json || '{}')
        if (state.dynamicStates && typeof state.dynamicStates.energy === 'number') {
          currentEnergy = state.dynamicStates.energy
        }
      } catch (e) {}

      // Average relevant attributes (Focus, Resilience, Willpower, etc.)
      const count = 5
      const sum = (character.execution_lvl + character.resilience_lvl + character.self_awareness_lvl + character.willpower_lvl) * 2 // approximation of 10-point scale
      attributesReadiness = Math.min(100, Math.max(10, Math.round(sum / count * 10)))
    }

    // Get average success rate of prior boss encounters
    const resolvedBattles = await prisma.bossBattle.findMany({
      where: { userId, status: 'RESOLVED' }
    })
    const wins = resolvedBattles.filter(b => b.outcome === 'VICTORIOUS').length
    const historicalSuccessRate = resolvedBattles.length > 0 ? (wins / resolvedBattles.length) : 0.8

    // Nemesis construct scaling weight
    const similarOverwhelmed = resolvedBattles.filter(
      b => b.title.toLowerCase().trim() === title.toLowerCase().trim() && b.outcome === 'OVERWHELMED'
    ).length
    const nemesisWeight = Math.min(3, similarOverwhelmed)

    // Call AI predictor engine
    const analysis = await SystemAI.analyzeBossBattle(
      title,
      estHours,
      phases.length,
      dependencies,
      historicalSuccessRate,
      currentEnergy,
      attributesReadiness,
      0, // skill level delta baseline
      nemesisWeight
    )

    // Create BossBattle in DB
    const bossBattle = await prisma.bossBattle.create({
      data: {
        userId,
        title,
        description: description || title,
        epicManifesto: epicManifesto || analysis.systemRecommendation,
        difficultyScore: analysis.difficultyScore,
        calculatedRank: analysis.calculatedRank,
        preparationScore: analysis.preparationScore,
        victoryProbability: analysis.victoryProbability,
        predictionReasoning: JSON.stringify(analysis.predictionReasoning),
        status: 'PREPARATION',
        originSource,
        timeLimitHours,
        unlockedSkills: JSON.stringify([]),
        phases: {
          create: phases.map((pTitle: string) => ({
            title: pTitle,
            isCompleted: false
          }))
        }
      },
      include: {
        phases: true
      }
    })

    return NextResponse.json({ bossBattle })
  } catch (error: any) {
    console.error('Initiate Boss Battle Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
