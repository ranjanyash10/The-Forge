import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed default Titles
  const titles = [
    {
      name: 'Wanderer',
      description: 'A blank slate. Seeking purpose in the dynamic expanse.',
      unlock_requirements: 'Default starter title.'
    },
    {
      name: 'Pathfinder',
      description: 'One who steps off the beaten track. Gained by mapping out skills.',
      unlock_requirements: 'Unlock 3 active skills.'
    },
    {
      name: 'Ascendant',
      description: 'Rising above the average. Gained through consistent progression.',
      unlock_requirements: 'Reach Global Level 10.'
    },
    {
      name: 'Monarch',
      description: 'Ruler of one\'s domain. Reserved for high ranks and legendary efforts.',
      unlock_requirements: 'Unlock Rank A or higher.'
    },
    {
      name: 'Sovereign',
      description: 'Complete autonomy. Gained through mastery in wealth and mind.',
      unlock_requirements: 'Reach Level 25 in Mind or Wealth, and Level 15 in Influence.'
    },
    {
      name: 'Eternal',
      description: 'A legend carved in stone. Legacy that echoes in The Forge.',
      unlock_requirements: 'Reach Global Level 50.'
    }
  ]

  for (const t of titles) {
    await prisma.title.upsert({
      where: { id: t.name }, // Use name as ID for simple seeding lookup
      update: {},
      create: {
        id: t.name,
        name: t.name,
        description: t.description,
        unlock_requirements: t.unlock_requirements
      }
    })
  }

  // Seed default Achievements
  const achievements = [
    {
      name: 'First Workout',
      description: 'Took the first step in forging the physical body.',
      badge: 'shield-alert',
      unlock_requirements: 'Complete a Body quest.'
    },
    {
      name: 'First 100 XP',
      description: 'Accumulate 100 global XP.',
      badge: 'award',
      unlock_requirements: 'Reach 100 global XP.'
    },
    {
      name: 'Level 10 Reached',
      description: 'Hit double digits in your global progression.',
      badge: 'zap',
      unlock_requirements: 'Reach Global Level 10.'
    },
    {
      name: '100 Deep Work Hours',
      description: 'Maintained intense mental focus for 100 hours.',
      badge: 'brain',
      unlock_requirements: 'Accumulate 100 hours of deep work.'
    },
    {
      name: 'First Client',
      description: 'Secured currency in exchange for high-level skill.',
      badge: 'dollar-sign',
      unlock_requirements: 'Complete a Wealth quest.'
    },
    {
      name: '10kg Lost',
      description: 'Shed weight through iron discipline.',
      badge: 'flame',
      unlock_requirements: 'Physique level up milestone.'
    },
    {
      name: '100 Consecutive Days Logged',
      description: 'A hundred days of consistent entries in the Daily Chronicle.',
      badge: 'calendar',
      unlock_requirements: 'Log 100 days in Daily Chronicle.'
    }
  ]

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: a.name },
      update: {},
      create: {
        id: a.name,
        name: a.name,
        description: a.description,
        badge: a.badge,
        unlock_requirements: a.unlock_requirements
      }
    })
  }

  // Create a default demo user for local environment if not exists
  const demoUserId = 'demo-user-id'
  const demoUser = await prisma.user.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      email: 'demo@theforge.org',
      username: 'ElysianMonarch',
      global_xp: 450,
      global_level: 4,
      current_title: 'Wanderer'
    }
  })

  // Give default user the Wanderer title
  await prisma.userTitle.upsert({
    where: { id: 'demo-user-wanderer' },
    update: {},
    create: {
      id: 'demo-user-wanderer',
      user_id: demoUserId,
      title_id: 'Wanderer'
    }
  })

  // Seed default skills
  const defaultSkills = [
    { name: 'Programming', category: 'MIND', description: 'Crafting logic systems and automation.', level: 3, xp: 120, rank: 'E' },
    { name: 'Physique', category: 'BODY', description: 'Sculpting the physical avatar.', level: 2, xp: 80, rank: 'E' },
    { name: 'SaaS', category: 'WEALTH', description: 'Building software assets that generate revenue.', level: 1, xp: 20, rank: 'E' }
  ]

  for (const s of defaultSkills) {
    await prisma.skill.create({
      data: {
        user_id: demoUserId,
        name: s.name,
        category: s.category,
        description: s.description,
        level: s.level,
        xp: s.xp,
        rank: s.rank
      }
    })
  }

  // Seed default quests
  const defaultQuests = [
    { title: 'Morning Run', description: 'Perform a 5km run at aerobic pace.', difficulty: 'E', xp_reward: 20, status: 'ACTIVE', quest_type: 'SIDE' },
    { title: 'Implement Prisma Schema', description: 'Complete database models for user progression.', difficulty: 'D', xp_reward: 50, status: 'ACTIVE', quest_type: 'MAIN' },
    { title: 'Client Pitch Deck', description: 'Assemble slides for client consultation.', difficulty: 'C', xp_reward: 100, status: 'ACTIVE', quest_type: 'ELITE' },
    { title: 'Release MVP to Production', description: 'Deploy the live URL of Next.js and launch.', difficulty: 'B', xp_reward: 300, status: 'ACTIVE', quest_type: 'BOSS' }
  ]

  for (const q of defaultQuests) {
    await prisma.quest.create({
      data: {
        user_id: demoUserId,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        xp_reward: q.xp_reward,
        status: q.status,
        quest_type: q.quest_type
      }
    })
  }

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
