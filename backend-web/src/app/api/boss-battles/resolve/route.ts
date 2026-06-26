import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      bossBattleId,
      outcome, // VICTORIOUS, WITHDRAWN, OVERWHELMED
      lessonsLearned = '',
      unlockedSkills = [] // array of strings
    } = body

    if (!bossBattleId || !outcome) {
      return NextResponse.json({ error: 'bossBattleId and outcome are required' }, { status: 400 })
    }

    const boss = await prisma.bossBattle.findUnique({
      where: { id: bossBattleId },
      include: { phases: true }
    })

    if (!boss) {
      return NextResponse.json({ error: 'Boss Battle not found' }, { status: 404 })
    }

    // Determine consequence narrative
    let consequenceNarrative = ''
    let xpGained = 0
    if (outcome === 'VICTORIOUS') {
      xpGained = boss.difficultyScore * 5 // e.g. 80 * 5 = 400 XP
      consequenceNarrative = `The candidate engaged the Construct: ${boss.title} and claimed total victory. Core parameters have stabilized, forging a deeper sense of resolution.`
    } else if (outcome === 'WITHDRAWN') {
      xpGained = 20 // minor consolidation XP
      consequenceNarrative = `A tactical withdrawal was logged. The candidate stepped back from the anvil to preserve momentum for future cycles.`
    } else if (outcome === 'OVERWHELMED') {
      xpGained = 10
      consequenceNarrative = `The Construct overwhelmed the candidate's current defenses. Heavy noise introduced into the matrix. Refined training of attributes is indicated.`
    }

    const durationDays = Math.max(1, Math.ceil((new Date().getTime() - new Date(boss.createdAt).getTime()) / (1000 * 60 * 60 * 24)))

    // Update Boss Battle
    const updatedBoss = await prisma.bossBattle.update({
      where: { id: bossBattleId },
      data: {
        status: 'RESOLVED',
        outcome,
        consequenceNarrative,
        unlockedSkills: JSON.stringify(unlockedSkills),
        resolvedAt: new Date(),
        archiveChapter: {
          create: {
            chapterTitle: `Chapter of ${boss.title}`,
            durationDays,
            lessonsLearned: lessonsLearned || `Confronted construct with success indicators and logged outcomes.`
          }
        }
      },
      include: {
        phases: true,
        archiveChapter: true
      }
    })

    // Award XP and update level if victorious
    if (xpGained > 0) {
      const user = await prisma.user.findUnique({
        where: { id: boss.userId }
      })
      if (user) {
        let newXp = user.global_xp + xpGained
        let newLevel = user.global_level
        while (newXp >= newLevel * 100) {
          newXp -= newLevel * 100
          newLevel += 1
        }
        await prisma.user.update({
          where: { id: boss.userId },
          data: {
            global_xp: newXp,
            global_level: newLevel
          }
        })
        
        // Log transaction
        await prisma.xPTransaction.create({
          data: {
            user_id: boss.userId,
            xp_amount: xpGained,
            reason: `Resolved Boss Battle: ${boss.title} (${outcome})`,
            source: 'BOSS_BATTLE'
          }
        })
      }
    }

    return NextResponse.json({ bossBattle: updatedBoss, xpGained })
  } catch (error: any) {
    console.error('Resolve Boss Battle Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
