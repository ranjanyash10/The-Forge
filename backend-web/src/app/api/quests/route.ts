import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const quests = await prisma.quest.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json({ quests })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', title, description, difficulty, xp_reward, quest_type, due_date } = body

    if (!title || !quest_type) {
      return NextResponse.json({ error: 'Title and quest_type are required' }, { status: 400 })
    }

    // Set default rewards based on type if not specified
    let reward = xp_reward
    if (!reward) {
      switch (quest_type) {
        case 'SIDE': reward = 20; break
        case 'MAIN': reward = 50; break
        case 'ELITE': reward = 100; break
        case 'BOSS': reward = 300; break
        default: reward = 20
      }
    }

    const quest = await prisma.quest.create({
      data: {
        user_id: userId,
        title,
        description: description || '',
        difficulty: difficulty || 'E',
        xp_reward: reward,
        status: 'ACTIVE',
        quest_type,
        due_date: due_date ? new Date(due_date) : null
      }
    })

    return NextResponse.json({ quest })
  } catch (error: any) {
    console.error('Quest Create Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let questId = searchParams.get('questId')

    if (!questId) {
      try {
        const body = await request.json()
        questId = body.questId
      } catch (e) {
        // Body was empty or invalid JSON, ignore
      }
    }

    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    const deletedQuest = await prisma.quest.delete({
      where: { id: questId }
    })

    return NextResponse.json({ success: true, deletedQuest })
  } catch (error: any) {
    console.error('Quest Delete Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
