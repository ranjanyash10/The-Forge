import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

async function completeQuestHelper(userId: string, questId: string) {
  const quest = await prisma.quest.findFirst({
    where: { id: questId, user_id: userId, status: 'ACTIVE' }
  })
  if (!quest) return null

  // Mark quest as completed
  const updatedQuest = await prisma.quest.update({
    where: { id: questId },
    data: { status: 'COMPLETED' }
  })

  const xpReward = quest.xp_reward

  // Update user global XP
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

  // Create XP Transaction
  await prisma.xPTransaction.create({
    data: {
      user_id: userId,
      xp_amount: xpReward,
      reason: `Completed quest: ${quest.title}`,
      source: 'DAILY_CHRONICLE'
    }
  })

  return updatedQuest
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const lastLog = await prisma.dailyLog.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    if (!lastLog) {
      return NextResponse.json({ isGapDetected: false })
    }

    const now = new Date()
    const daysOfSilence = Math.floor((now.getTime() - lastLog.created_at.getTime()) / (1000 * 60 * 60 * 24))

    if (daysOfSilence >= 3) {
      // Check if a SILENCE_GAP codex entry was already created for this gap duration to avoid duplicates
      const existingGap = await prisma.codexEntry.findFirst({
        where: {
          userId,
          type: 'SILENCE_GAP',
          createdAt: { gte: lastLog.created_at }
        }
      })

      if (!existingGap) {
        await prisma.codexEntry.create({
          data: {
            userId,
            type: 'SILENCE_GAP',
            importance: daysOfSilence > 14 ? 'EPIC' : 'HIGH',
            narrativeState: `The Forge remained inactive for an extended sequence of ${daysOfSilence} cycles.`,
            rawUserQuote: `[System Detected Absence: ${daysOfSilence} Days]`,
            linkedEntities: JSON.stringify({ days_lost: daysOfSilence })
          }
        })
      }

      return NextResponse.json({
        isGapDetected: true,
        duration: daysOfSilence,
        greetingsFrame: `The Forge remained quiet for ${daysOfSilence} cycles. No entries were recorded. No judgment follows that fact. Only one question matters now. Where does the story continue?`
      })
    }

    return NextResponse.json({ isGapDetected: false })
  } catch (error: any) {
    console.error('Silence Check Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', reflection, notes, mood, energy, weight } = body

    // ----------------------------------------------------
    // CASE A: CONVERSATIONAL PORTAL REFLECTION PIPELINE
    // ----------------------------------------------------
    if (reflection) {
      // 1. Fetch character details
      const character = await prisma.character.findUnique({
        where: { user_id: userId }
      })

      if (!character) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 })
      }

      // 2. Fetch active quests & boss phases
      const activeQuests = await prisma.quest.findMany({
        where: { user_id: userId, status: 'ACTIVE' }
      })

      const activeBosses = await prisma.bossBattle.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { phases: { where: { isCompleted: false } } }
      })

      const activeQuestsAndPhases: string[] = []
      activeQuests.forEach(q => activeQuestsAndPhases.push(`QUEST: ${q.title}`))
      activeBosses.forEach((b: any) => {
        b.phases.forEach((p: any) => {
          activeQuestsAndPhases.push(`PHASE: ${p.title} (Boss: ${b.title})`)
        })
      })

      // 3. Invoke The Analyst (First AI Stage)
      const analystPayload = await SystemAI.runAnalyst(reflection, activeQuestsAndPhases)

      const extractedMood = analystPayload.character_state_modifiers.mood || 'Reflective'
      const extractedEnergy = analystPayload.character_state_modifiers.estimated_energy_level || 5

      // 4. Create raw DailyLog entry
      const dailyLog = await prisma.dailyLog.create({
        data: {
          user_id: userId,
          notes: reflection,
          mood: extractedMood,
          energy: extractedEnergy,
          system_analysis: JSON.stringify({
            context: analystPayload.environmental_context_extractions,
            modifiers: analystPayload.character_state_modifiers
          }),
          weight: weight ? weight.toString() : null
        }
      })

      if (weight) {
        await prisma.character.update({
          where: { user_id: userId },
          data: { weight: weight.toString() }
        }).catch(err => console.error('Failed to sync weight:', err))
      }

      // 5. Check confidence score threshold (Epistemic Humility Rule)
      const isLowConfidence = analystPayload.confidence_score < 0.8

      if (isLowConfidence) {
        // Flag assertion as PENDING_VALIDATION and skip immediate completions
        const pendingAssertion = await prisma.systemAssertion.create({
          data: {
            userId,
            claimText: reflection,
            confidenceScore: analystPayload.confidence_score,
            evidenceLogs: JSON.stringify(analystPayload.quest_and_phase_resolutions),
            linkedCodexIds: JSON.stringify(analystPayload.proposed_memory_candidates),
            status: 'PENDING_VALIDATION'
          }
        })

        return NextResponse.json({
          success: true,
          needsCalibration: true,
          calibrationId: pendingAssertion.id,
          calibrationPrompt: analystPayload.user_calibration_prompt || 'I detected progress details, but need clarification to align reality.',
          log: dailyLog
        })
      }

      // Otherwise, process as high confidence (ACCEPTED)
      const resolvedQuests = []
      for (const res of analystPayload.quest_and_phase_resolutions) {
        if (res.resolution_status === 'COMPLETED') {
          if (res.matched_active_entity.startsWith('QUEST:')) {
            const questTitle = res.matched_active_entity.replace('QUEST:', '').trim()
            const matchQ = activeQuests.find(q => q.title.toLowerCase() === questTitle.toLowerCase())
            if (matchQ) {
              const comp = await completeQuestHelper(userId, matchQ.id)
              if (comp) resolvedQuests.push(comp)
            }
          } else if (res.matched_active_entity.startsWith('PHASE:')) {
            const rawPhaseTitle = res.matched_active_entity.replace('PHASE:', '').trim()
            const cleanPhaseTitle = rawPhaseTitle.split(' (Boss:')[0].trim()

            for (const b of activeBosses) {
              const matchP = (b as any).phases.find((p: any) => p.title.toLowerCase() === cleanPhaseTitle.toLowerCase())
              if (matchP) {
                await prisma.bossPhase.update({
                  where: { id: matchP.id },
                  data: { isCompleted: true, completedAt: new Date() }
                })
              }
            }
          }
        }
      }

      // 6. Update Character dynamic states & attributes
      let stateJsonStr = character.state_json || '{}'
      let parsedState: any = {}
      try {
        parsedState = JSON.parse(stateJsonStr)
      } catch (e) {}

      if (!parsedState.dynamicStates) {
        parsedState.dynamicStates = { energy: 70, stress: 45, confidence: 60, fulfillment: 50, motivation: 70 }
      }
      if (!parsedState.attributes) {
        parsedState.attributes = {
          "Strength": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Endurance": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Agility": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Vitality": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Focus": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Knowledge": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Creativity": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Resilience": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
          "Charisma": { "level": 10, "xp": 0, "trend": "Stable", "title": null }
        }
      }

      const ds = parsedState.dynamicStates
      const modifiers = analystPayload.character_state_modifiers
      ds.energy = Math.max(0, Math.min(100, ds.energy + (modifiers.energy_delta || 0)))
      ds.stress = Math.max(0, Math.min(100, ds.stress + (modifiers.stress_delta || 0)))
      ds.fulfillment = Math.max(0, Math.min(100, ds.fulfillment + (modifiers.fulfillment_delta || 0)))

      // Allocate XP for resolutions
      for (const res of analystPayload.quest_and_phase_resolutions) {
        if (res.resolution_status === 'COMPLETED' && res.attribute_allocations) {
          for (const attrAlloc of res.attribute_allocations) {
            const attrObj = parsedState.attributes[attrAlloc.name]
            if (attrObj) {
              attrObj.xp += attrAlloc.xp
              let reqXp = attrObj.level * 500
              while (attrObj.xp >= reqXp) {
                attrObj.xp -= reqXp
                attrObj.level += 1
                reqXp = attrObj.level * 500
              }
            }
          }
        }
      }

      await prisma.character.update({
        where: { id: character.id },
        data: { state_json: JSON.stringify(parsedState) }
      })

      // Commit the Accepted assertion row
      await prisma.systemAssertion.create({
        data: {
          userId,
          claimText: reflection,
          confidenceScore: analystPayload.confidence_score,
          evidenceLogs: JSON.stringify(analystPayload.quest_and_phase_resolutions),
          linkedCodexIds: JSON.stringify([]),
          status: 'ACCEPTED'
        }
      })

      // 7. Invoke The Chronicler (Sifter memory pipeline)
      const existingEntries = await prisma.codexEntry.findMany({
        where: { userId }
      })
      const historyStrings = existingEntries.map(e => `${e.type}: ${e.narrativeState}`)

      for (const candidate of analystPayload.proposed_memory_candidates) {
        const sifterResult = await SystemAI.evaluateLongTermSignificance(candidate, historyStrings)
        if (sifterResult.isSignificant) {
          await prisma.codexEntry.create({
            data: {
              userId,
              type: candidate.type,
              importance: sifterResult.rank || 'COMMON',
              narrativeState: sifterResult.contextualReframing || candidate.summary,
              rawUserQuote: candidate.raw_quote,
              isChallenged: false,
              linkedEntities: JSON.stringify({ evaluation_cycle: "DAILY_CHRONICLE" })
            }
          })
        }
      }

      // 8. Adaptive Dynamic Quest Check
      if (ds.energy < 50 || ds.stress > 70) {
        console.log('Low energy or high stress detected, spawning adaptive dynamic quest')
        const adaptive = await SystemAI.generateDynamicQuest(reflection, ds.energy, ds.stress)
        await prisma.quest.create({
          data: {
            user_id: userId,
            title: adaptive.title,
            description: adaptive.description,
            quest_type: adaptive.quest_type || 'OPPORTUNITY',
            difficulty: adaptive.difficulty || 'E',
            xp_reward: adaptive.xp_reward || 25,
            reason: adaptive.reason,
            status: 'ACTIVE'
          }
        })
      }

      return NextResponse.json({
        success: true,
        log: dailyLog,
        analysis: extractedMood,
        xpTransactions: analystPayload.quest_and_phase_resolutions,
        spawnedQuests: resolvedQuests,
        environmentalContext: analystPayload.environmental_context_extractions,
        characterStates: ds
      })
    }

    // ----------------------------------------------------
    // CASE B: BACKWARD COMPATIBLE MANUAL PARAMETER ROAD
    // ----------------------------------------------------
    if (!notes || !mood || !energy) {
      return NextResponse.json({ error: 'Notes, mood, and energy level are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const skillNames = user.skills.map(s => s.name)
    const aiAnalysis = await SystemAI.analyzeDailyLog(notes, mood, energy, skillNames)

    const dailyLog = await prisma.dailyLog.create({
      data: {
        user_id: userId,
        notes,
        mood,
        energy: parseInt(energy),
        system_analysis: aiAnalysis.analysis,
        weight: weight ? weight.toString() : null
      }
    })

    if (weight) {
      await prisma.character.update({
        where: { user_id: userId },
        data: { weight: weight.toString() }
      }).catch(err => console.error('Failed to sync weight to character:', err))
    }

    const processedTransactions = []
    let globalLevelUp = false
    let currentGlobalXp = user.global_xp
    let currentGlobalLevel = user.global_level

    for (const alloc of aiAnalysis.xpTransactions) {
      const dbSkill = user.skills.find(s => s.name.toLowerCase() === alloc.skillName.toLowerCase())

      if (dbSkill) {
        let currentSkillXp = dbSkill.xp + alloc.xp
        let currentSkillLevel = dbSkill.level
        let currentSkillRank = dbSkill.rank

        while (currentSkillXp >= getXpForNextLevel(currentSkillLevel)) {
          currentSkillXp -= getXpForNextLevel(currentSkillLevel)
          currentSkillLevel += 1
        }

        if (currentSkillLevel >= 30) currentSkillRank = 'S'
        else if (currentSkillLevel >= 20) currentSkillRank = 'A'
        else if (currentSkillLevel >= 15) currentSkillRank = 'B'
        else if (currentSkillLevel >= 10) currentSkillRank = 'C'
        else if (currentSkillLevel >= 5) currentSkillRank = 'D'

        await prisma.skill.update({
          where: { id: dbSkill.id },
          data: {
            xp: currentSkillXp,
            level: currentSkillLevel,
            rank: currentSkillRank
          }
        })

        await prisma.xPTransaction.create({
          data: {
            user_id: userId,
            skill_id: dbSkill.id,
            xp_amount: alloc.xp,
            reason: alloc.reason,
            source: 'DAILY_CHRONICLE'
          }
        })
      } else {
        currentGlobalXp += alloc.xp
        await prisma.xPTransaction.create({
          data: {
            user_id: userId,
            skill_id: null,
            xp_amount: alloc.xp,
            reason: alloc.reason,
            source: 'DAILY_CHRONICLE'
          }
        })
      }

      processedTransactions.push({
        skillName: alloc.skillName,
        xpGained: alloc.xp,
        reason: alloc.reason
      })
    }

    while (currentGlobalXp >= getXpForNextLevel(currentGlobalLevel)) {
      currentGlobalXp -= getXpForNextLevel(currentGlobalLevel)
      currentGlobalLevel += 1
      globalLevelUp = true
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        global_xp: currentGlobalXp,
        global_level: currentGlobalLevel
      }
    })

    const spawnedQuests = []
    for (const q of aiAnalysis.suggestedQuests) {
      const newQuest = await prisma.quest.create({
        data: {
          user_id: userId,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          xp_reward: q.xp_reward,
          status: 'ACTIVE',
          quest_type: q.quest_type
        }
      })
      spawnedQuests.push(newQuest)
    }

    return NextResponse.json({
      success: true,
      log: dailyLog,
      analysis: aiAnalysis.analysis,
      xpTransactions: processedTransactions,
      spawnedQuests,
      globalLevelUp,
      newGlobalLevel: currentGlobalLevel,
      newGlobalXp: currentGlobalXp,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses
    })
  } catch (error: any) {
    console.error('Daily Log Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
