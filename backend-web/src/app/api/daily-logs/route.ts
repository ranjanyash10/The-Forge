import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', notes, mood, energy, weight } = body

    if (!notes || !mood || !energy) {
      return NextResponse.json({ error: 'Notes, mood, and energy level are required' }, { status: 400 })
    }

    // 1. Fetch user and their skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const skillNames = user.skills.map(s => s.name)

    // 2. Call System AI for Daily Analysis
    const aiAnalysis = await SystemAI.analyzeDailyLog(notes, mood, energy, skillNames)

    // 3. Save Daily Log to database
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

    // Sync weight to Character if provided
    if (weight) {
      await prisma.character.update({
        where: { user_id: userId },
        data: { weight: weight.toString() }
      }).catch(err => console.error('Failed to sync weight to character:', err))
    }

    // 4. Distribute AI suggested XP allocations
    const processedTransactions = []
    let globalLevelUp = false
    let currentGlobalXp = user.global_xp
    let currentGlobalLevel = user.global_level

    for (const alloc of aiAnalysis.xpTransactions) {
      const dbSkill = user.skills.find(s => s.name.toLowerCase() === alloc.skillName.toLowerCase())

      if (dbSkill) {
        // Distribute to skill
        let currentSkillXp = dbSkill.xp + alloc.xp
        let currentSkillLevel = dbSkill.level
        let currentSkillRank = dbSkill.rank

        while (currentSkillXp >= getXpForNextLevel(currentSkillLevel)) {
          currentSkillXp -= getXpForNextLevel(currentSkillLevel)
          currentSkillLevel += 1
        }

        // Rank updates
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

        // Also record transactions
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
        // Distribute general global XP
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

    // Process general/global XP level-ups
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

    // 5. Spawn AI-suggested quests in the user's quest log for tomorrow
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
