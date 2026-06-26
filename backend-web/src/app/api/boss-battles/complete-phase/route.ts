import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phaseId, isCompleted } = body

    if (!phaseId) {
      return NextResponse.json({ error: 'phaseId is required' }, { status: 400 })
    }

    // Toggle the phase
    const phase = await prisma.bossPhase.update({
      where: { id: phaseId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    })

    // Fetch the parent boss battle and all its phases
    const boss = await prisma.bossBattle.findUnique({
      where: { id: phase.bossBattleId },
      include: { phases: true }
    })

    if (!boss) {
      return NextResponse.json({ error: 'Boss Battle not found' }, { status: 404 })
    }

    const totalPhases = boss.phases.length
    const completedPhases = boss.phases.filter(p => p.isCompleted).length

    // Recalculate preparationScore and victoryProbability
    const character = await prisma.character.findUnique({
      where: { user_id: boss.userId }
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
      const count = 5
      const sum = (character.execution_lvl + character.resilience_lvl + character.self_awareness_lvl + character.willpower_lvl) * 2
      attributesReadiness = Math.min(100, Math.max(10, Math.round(sum / count * 10)))
    }

    const maxWeight = (0.5 * totalPhases) + 50
    const currentWeight = (0.5 * completedPhases) + (0.3 * attributesReadiness) + (0.2 * currentEnergy)
    const preparationScore = Math.round((currentWeight / maxWeight) * 100)

    // Historical win rates / nemesis weight calculation
    const resolvedBattles = await prisma.bossBattle.findMany({
      where: { userId: boss.userId, status: 'RESOLVED' }
    })
    const wins = resolvedBattles.filter(b => b.outcome === 'VICTORIOUS').length
    const historicalSuccessRate = resolvedBattles.length > 0 ? (wins / resolvedBattles.length) : 0.8
    const similarOverwhelmed = resolvedBattles.filter(
      b => b.title.toLowerCase().trim() === boss.title.toLowerCase().trim() && b.outcome === 'OVERWHELMED'
    ).length
    const nemesisWeight = Math.min(3, similarOverwhelmed)

    const skillLevelDelta = 0
    const victoryProbability = Math.min(99, Math.max(5, Math.round(50 + (preparationScore * 0.4) + (skillLevelDelta * 2) - (nemesisWeight * 5))))

    // Update parent BossBattle
    const updatedBoss = await prisma.bossBattle.update({
      where: { id: boss.id },
      data: {
        preparationScore,
        victoryProbability
      },
      include: {
        phases: true,
        archiveChapter: true
      }
    })

    return NextResponse.json({ bossBattle: updatedBoss })
  } catch (error: any) {
    console.error('Complete Boss Phase Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
