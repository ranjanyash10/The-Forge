import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', skillRequest, accept = false, name, category, difficulty, description } = body

    if (!skillRequest && !accept) {
      return NextResponse.json({ error: 'Skill request query is required' }, { status: 400 })
    }

    if (accept) {
      // User accepted the discovered skill. Save it to DB.
      if (!name || !category || !difficulty) {
        return NextResponse.json({ error: 'Incomplete skill data for acceptance' }, { status: 400 })
      }

      // Check if skill already exists for the user
      const existingSkill = await prisma.skill.findFirst({
        where: { user_id: userId, name }
      })

      if (existingSkill) {
        return NextResponse.json({ message: 'Skill already active', skill: existingSkill })
      }

      const newSkill = await prisma.skill.create({
        data: {
          user_id: userId,
          name,
          category,
          description: description || 'Refined focus in this domain.',
          rank: 'E',
          level: 1,
          xp: 0,
          is_active: true
        }
      })

      // Record transaction
      await prisma.xPTransaction.create({
        data: {
          user_id: userId,
          skill_id: newSkill.id,
          xp_amount: 10,
          reason: `Unlocked new skill pathway: ${name}`,
          source: 'SYSTEM'
        }
      })

      // Add 10 XP to user global XP for unlocking path
      await prisma.user.update({
        where: { id: userId },
        data: {
          global_xp: { increment: 10 }
        }
      })

      return NextResponse.json({ success: true, skill: newSkill })
    } else {
      // Evaluate new skill intent using System AI
      const evaluation = await SystemAI.discoverSkill(skillRequest)
      return NextResponse.json({ evaluation })
    }
  } catch (error: any) {
    console.error('Skill Discovery Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
