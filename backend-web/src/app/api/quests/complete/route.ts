import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Calculate XP required to pass current level
// Level 1: 100 XP, Level 2: 200 XP, Level 3: 300 XP, etc.
function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', questId, skillId } = body

    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    // 1. Fetch quest details
    const quest = await prisma.quest.findFirst({
      where: { id: questId, user_id: userId }
    })

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (quest.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Quest already completed', quest })
    }

    // 2. Mark quest as completed
    const updatedQuest = await prisma.quest.update({
      where: { id: questId },
      data: { status: 'COMPLETED' }
    })

    const xpReward = quest.xp_reward

    // 3. Update global XP and Level
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let currentGlobalXp = user.global_xp + xpReward
    let currentGlobalLevel = user.global_level
    let globalLevelUp = false

    // Check level up threshold
    while (currentGlobalXp >= getXpForNextLevel(currentGlobalLevel)) {
      currentGlobalXp -= getXpForNextLevel(currentGlobalLevel)
      currentGlobalLevel += 1
      globalLevelUp = true
    }

    // Save user updates
    await prisma.user.update({
      where: { id: userId },
      data: {
        global_xp: currentGlobalXp,
        global_level: currentGlobalLevel
      }
    })

    // Update Character attributes (momentum, last_action, attributes)
    const character = await prisma.character.findUnique({
      where: { user_id: userId }
    })

    if (character) {
      const now = new Date()
      const lastActionDate = character.last_action ? new Date(character.last_action) : new Date()
      const elapsedMs = now.getTime() - lastActionDate.getTime()
      const elapsedHours = elapsedMs / (1000 * 60 * 60)
      
      let baseMomentum = character.momentum
      if (elapsedHours > 0.5) {
        const decayAmount = 2.5 * Math.log(elapsedHours + 1)
        baseMomentum = Math.max(0, Math.round(baseMomentum - decayAmount))
      }

      let baseBoost = 10
      switch (quest.quest_type) {
        case 'SIDE': baseBoost = 10; break
        case 'MAIN': baseBoost = 20; break
        case 'ELITE': baseBoost = 35; break
        case 'BOSS': baseBoost = 60; break
      }
      const momentumDelta = baseBoost * Math.log10(100 - baseMomentum + 2)
      const newMomentum = Math.min(100, Math.round(baseMomentum + momentumDelta))

      let execXp = character.execution_xp + Math.round(xpReward * 0.5)
      let execLvl = character.execution_lvl
      while (execXp >= execLvl * 100) {
        execXp -= execLvl * 100
        execLvl += 1
      }

      let resiXp = character.resilience_xp + Math.round(xpReward * 0.2)
      let resiLvl = character.resilience_lvl
      while (resiXp >= resiLvl * 100) {
        resiXp -= resiLvl * 100
        resiLvl += 1
      }

      let wisXp = character.wisdom_xp
      let wisLvl = character.wisdom_lvl
      let mobXp = character.mobility_xp
      let mobLvl = character.mobility_lvl
      let strXp = character.strength_xp
      let strLvl = character.strength_lvl
      let wilXp = character.willpower_xp
      let wilLvl = character.willpower_lvl
      let adapXp = character.adaptability_xp
      let adapLvl = character.adaptability_lvl

      if (skillId) {
        const skill = await prisma.skill.findFirst({
          where: { id: skillId, user_id: userId }
        })
        if (skill) {
          if (skill.category === 'BODY') {
            mobXp += Math.round(xpReward * 0.5)
            while (mobXp >= mobLvl * 100) {
              mobXp -= mobLvl * 100
              mobLvl += 1
            }
            strXp += Math.round(xpReward * 0.5)
            while (strXp >= strLvl * 100) {
              strXp -= strLvl * 100
              strLvl += 1
            }
          } else if (skill.category === 'MIND') {
            wisXp += Math.round(xpReward * 0.5)
            while (wisXp >= wisLvl * 100) {
              wisXp -= wisLvl * 100
              wisLvl += 1
            }
            wilXp += Math.round(xpReward * 0.3)
            while (wilXp >= wilLvl * 100) {
              wilXp -= wilLvl * 100
              wilLvl += 1
            }
          } else if (skill.category === 'WEALTH') {
            wilXp += Math.round(xpReward * 0.4)
            while (wilXp >= wilLvl * 100) {
              wilXp -= wilLvl * 100
              wilLvl += 1
            }
            adapXp += Math.round(xpReward * 0.4)
            while (adapXp >= adapLvl * 100) {
              adapXp -= adapLvl * 100
              adapLvl += 1
            }
          }
        }
      }

      await prisma.character.update({
        where: { id: character.id },
        data: {
          momentum: newMomentum,
          last_action: now,
          execution_xp: execXp,
          execution_lvl: execLvl,
          resilience_xp: resiXp,
          resilience_lvl: resiLvl,
          wisdom_xp: wisXp,
          wisdom_lvl: wisLvl,
          mobility_xp: mobXp,
          mobility_lvl: mobLvl,
          strength_xp: strXp,
          strength_lvl: strLvl,
          willpower_xp: wilXp,
          willpower_lvl: wilLvl,
          adaptability_xp: adapXp,
          adaptability_lvl: adapLvl
        }
      })
    }

    // 4. Update associated skill if provided
    let skillLevelUp = false
    let updatedSkill = null

    if (skillId) {
      const skill = await prisma.skill.findFirst({
        where: { id: skillId, user_id: userId }
      })

      if (skill) {
        let currentSkillXp = skill.xp + xpReward
        let currentSkillLevel = skill.level
        let currentSkillRank = skill.rank

        while (currentSkillXp >= getXpForNextLevel(currentSkillLevel)) {
          currentSkillXp -= getXpForNextLevel(currentSkillLevel)
          currentSkillLevel += 1
          skillLevelUp = true
        }

        // Rank updates based on skill levels (Dynamic Rank progression)
        // E (Level 1-4), D (Level 5-9), C (Level 10-14), B (Level 15-19), A (Level 20-29), S (Level 30+)
        if (currentSkillLevel >= 30) currentSkillRank = 'S'
        else if (currentSkillLevel >= 20) currentSkillRank = 'A'
        else if (currentSkillLevel >= 15) currentSkillRank = 'B'
        else if (currentSkillLevel >= 10) currentSkillRank = 'C'
        else if (currentSkillLevel >= 5) currentSkillRank = 'D'

        updatedSkill = await prisma.skill.update({
          where: { id: skillId },
          data: {
            xp: currentSkillXp,
            level: currentSkillLevel,
            rank: currentSkillRank
          }
        })
      }
    }

    // 5. Create XP transaction record
    await prisma.xPTransaction.create({
      data: {
        user_id: userId,
        skill_id: skillId || null,
        xp_amount: xpReward,
        reason: `Completed quest: ${quest.title}`,
        source: 'QUEST'
      }
    })

    // 6. Check and unlock Achievements
    const unlockedAchievements: string[] = []
    const userAchievements = await prisma.userAchievement.findMany({
      where: { user_id: userId },
      include: { achievement: true }
    })
    const existingAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id))

    const evaluateAchievement = async (achievementId: string) => {
      if (!existingAchievementIds.has(achievementId)) {
        await prisma.userAchievement.create({
          data: {
            user_id: userId,
            achievement_id: achievementId
          }
        })
        unlockedAchievements.push(achievementId)
      }
    }

    // Achievement: First Workout
    if (quest.quest_type === 'SIDE' && (quest.title.toLowerCase().includes('run') || quest.title.toLowerCase().includes('workout') || quest.title.toLowerCase().includes('physique'))) {
      await evaluateAchievement('First Workout')
    }
    // Achievement: First Client
    if (quest.quest_type === 'ELITE' && quest.title.toLowerCase().includes('client')) {
      await evaluateAchievement('First Client')
    }
    // Achievement: First 100 XP
    if (currentGlobalXp + (currentGlobalLevel - 1) * 100 >= 100) {
      await evaluateAchievement('First 100 XP')
    }
    // Achievement: Level 10 Reached
    if (currentGlobalLevel >= 10) {
      await evaluateAchievement('Level 10 Reached')
    }

    // 7. Check and unlock Titles
    const unlockedTitles: string[] = []
    const userTitles = await prisma.userTitle.findMany({
      where: { user_id: userId },
      include: { title: true }
    })
    const existingTitleIds = new Set(userTitles.map(ut => ut.title_id))

    const evaluateTitle = async (titleId: string) => {
      if (!existingTitleIds.has(titleId)) {
        await prisma.userTitle.create({
          data: {
            user_id: userId,
            title_id: titleId
          }
        })
        unlockedTitles.push(titleId)
      }
    }

    // Pathfinder Title: Unlock 3 active skills
    const userSkillsCount = await prisma.skill.count({ where: { user_id: userId } })
    if (userSkillsCount >= 3) {
      await evaluateTitle('Pathfinder')
    }
    // Ascendant Title: Reach Global Level 10
    if (currentGlobalLevel >= 10) {
      await evaluateTitle('Ascendant')
    }
    // Monarch Title: Unlock Rank A or higher in any skill
    if (updatedSkill && (updatedSkill.rank === 'A' || updatedSkill.rank === 'S')) {
      await evaluateTitle('Monarch')
    }

    return NextResponse.json({
      success: true,
      quest: updatedQuest,
      xpGained: xpReward,
      globalLevelUp,
      newGlobalLevel: currentGlobalLevel,
      newGlobalXp: currentGlobalXp,
      xpNeeded: getXpForNextLevel(currentGlobalLevel),
      skillLevelUp,
      updatedSkill,
      unlockedAchievements,
      unlockedTitles
    })
  } catch (error: any) {
    console.error('Quest Completion Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
