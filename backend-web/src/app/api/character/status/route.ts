import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    // Retrieve user and related character stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        character: {
          include: {
            snapshots: {
              orderBy: { created_at: 'desc' }
            }
          }
        },
        skills: {
          orderBy: { name: 'asc' }
        },
        quests: {
          orderBy: { created_at: 'desc' }
        },
        achievements: {
          include: { achievement: true }
        },
        titles: {
          include: { title: true }
        },
        dailyLogs: {
          orderBy: { created_at: 'desc' },
          take: 31
        },
        chapters: {
          orderBy: { chapter_number: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.character) {
      const now = new Date()
      const lastActionDate = user.character.last_action ? new Date(user.character.last_action) : new Date()
      const elapsedMs = now.getTime() - lastActionDate.getTime()
      const elapsedHours = elapsedMs / (1000 * 60 * 60)
      if (elapsedHours > 0.5) {
        const decayAmount = 2.5 * Math.log(elapsedHours + 1)
        const newMomentum = Math.max(0, Math.round(user.character.momentum - decayAmount))
        if (newMomentum !== user.character.momentum) {
          user.character.momentum = newMomentum
          await prisma.character.update({
            where: { id: user.character.id },
            data: { momentum: newMomentum, last_action: now }
          }).catch(e => console.error('Decay update error:', e))
        }
      }
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Status Fetch Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
