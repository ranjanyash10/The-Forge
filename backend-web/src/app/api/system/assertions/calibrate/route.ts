import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

async function completeQuestHelper(userId: string, questId: string) {
  const quest = await prisma.quest.findFirst({
    where: { id: questId, user_id: userId, status: 'ACTIVE' }
  })
  if (!quest) return null

  const updatedQuest = await prisma.quest.update({
    where: { id: questId },
    data: { status: 'COMPLETED' }
  })

  const xpReward = quest.xp_reward

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    let currentGlobalXp = user.global_xp + xpReward
    let currentGlobalLevel = user.global_level
    while (currentGlobalXp >= getXpForNextLevel(currentGlobalLevel)) {
      currentGlobalXp -= getXpForNextLevel(currentGlobalLevel)
      currentGlobalLevel += 1
    }
    await prisma.user.update({
      where: { id: userId },
      data: { global_xp: currentGlobalXp, global_level: currentGlobalLevel }
    })
  }

  await prisma.xPTransaction.create({
    data: {
      user_id: userId,
      xp_amount: xpReward,
      reason: `Completed quest: ${quest.title} (Via Calibration)`,
      source: 'DAILY_CHRONICLE'
    }
  })

  return updatedQuest
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', assertionId, userAction, customInput } = body

    if (!assertionId || !userAction) {
      return NextResponse.json({ error: 'Assertion ID and user action are required' }, { status: 400 })
    }

    const assertion = await prisma.systemAssertion.findUnique({
      where: { id: assertionId }
    })

    if (!assertion) {
      return NextResponse.json({ error: 'System assertion not found' }, { status: 404 })
    }

    if (assertion.status !== 'PENDING_VALIDATION') {
      return NextResponse.json({ error: 'Assertion already calibrated' }, { status: 400 })
    }

    // 1. Handle ACCEPTED flow (execute resolutions)
    if (userAction === 'ACCEPT') {
      const resolutions = JSON.parse(assertion.evidenceLogs || '[]')
      const resolvedQuests = []

      // Complete quests
      for (const res of resolutions) {
        if (res.resolution_status === 'COMPLETED' && res.matched_active_entity.startsWith('QUEST:')) {
          const questTitle = res.matched_active_entity.replace('QUEST:', '').trim()
          const matchQ = await prisma.quest.findFirst({
            where: { user_id: userId, title: { equals: questTitle }, status: 'ACTIVE' }
          })
          if (matchQ) {
            const comp = await completeQuestHelper(userId, matchQ.id)
            if (comp) resolvedQuests.push(comp)
          }
        } else if (res.resolution_status === 'COMPLETED' && res.matched_active_entity.startsWith('PHASE:')) {
          const rawPhaseTitle = res.matched_active_entity.replace('PHASE:', '').trim()
          const cleanPhaseTitle = rawPhaseTitle.split(' (Boss:')[0].trim()

          const activePhase = await prisma.bossPhase.findFirst({
            where: {
              bossBattle: { userId, status: 'ACTIVE' },
              title: { contains: cleanPhaseTitle },
              isCompleted: false
            }
          })
          if (activePhase) {
            await prisma.bossPhase.update({
              where: { id: activePhase.id },
              data: { isCompleted: true, completedAt: new Date() }
            })
          }
        }
      }

      await prisma.systemAssertion.update({
        where: { id: assertionId },
        data: { status: 'ACCEPTED' }
      })

      // Try to parse linked memories candidate and sift them
      const proposedMemories = JSON.parse(assertion.linkedCodexIds || '[]')
      for (const candidate of proposedMemories) {
        // Automatically save accepted narrative events to Codex
        await prisma.codexEntry.create({
          data: {
            userId,
            type: candidate.type,
            importance: 'COMMON',
            narrativeState: candidate.summary,
            rawUserQuote: candidate.raw_quote,
            isChallenged: false,
            linkedEntities: JSON.stringify({ source_assertion: assertionId })
          }
        })
      }

      return NextResponse.json({
        success: true,
        status: 'ACCEPTED',
        resolvedQuests
      })
    }

    // 2. Handle REFUTED / ADJUSTED flow
    if (userAction === 'REFUTE' || userAction === 'ADJUST') {
      // Award manual custom XP adjustments if parsed
      let adjustmentApplied = false
      let customXpGranted = 0

      if (userAction === 'ADJUST' && customInput) {
        // Try parsing XP from input e.g. "give me 30 XP"
        const match = customInput.match(/(\d+)\s*xp/i)
        if (match) {
          customXpGranted = parseInt(match[1])
          adjustmentApplied = true

          await prisma.xPTransaction.create({
            data: {
              user_id: userId,
              xp_amount: customXpGranted,
              reason: `Calibration Adjustment: ${customInput}`,
              source: 'DAILY_CHRONICLE'
            }
          })

          // Update user global XP
          const user = await prisma.user.findUnique({ where: { id: userId } })
          if (user) {
            let currentGlobalXp = user.global_xp + customXpGranted
            let currentGlobalLevel = user.global_level
            while (currentGlobalXp >= getXpForNextLevel(currentGlobalLevel)) {
              currentGlobalXp -= getXpForNextLevel(currentGlobalLevel)
              currentGlobalLevel += 1
            }
            await prisma.user.update({
              where: { id: userId },
              data: { global_xp: currentGlobalXp, global_level: currentGlobalLevel }
            })
          }
        }
      }

      // Update SystemAssertion status to REFUTED
      await prisma.systemAssertion.update({
        where: { id: assertionId },
        data: {
          status: 'REFUTED',
          claimText: customInput ? `${assertion.claimText} | User Correction: ${customInput}` : assertion.claimText
        }
      })

      // Find user codex entries to increment correction count
      const oldestEntry = await prisma.codexEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      if (oldestEntry) {
        await prisma.codexEntry.update({
          where: { id: oldestEntry.id },
          data: { userCorrectionCount: oldestEntry.userCorrectionCount + 1 }
        })
      }

      return NextResponse.json({
        success: true,
        status: 'REFUTED',
        adjustmentApplied,
        customXpGranted
      })
    }

    return NextResponse.json({ error: 'Invalid calibration action' }, { status: 400 })
  } catch (error: any) {
    console.error('Calibration API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
