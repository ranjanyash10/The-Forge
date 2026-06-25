import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', titleId } = body

    if (!titleId) {
      return NextResponse.json({ error: 'Title ID is required' }, { status: 400 })
    }

    // Verify user has unlocked the title
    const earnedTitle = await prisma.userTitle.findFirst({
      where: { user_id: userId, title_id: titleId }
    })

    if (!earnedTitle) {
      return NextResponse.json({ error: 'Title not earned or unlocked' }, { status: 403 })
    }

    // Update user's current title
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { current_title: titleId }
    })

    return NextResponse.json({ success: true, current_title: updatedUser.current_title })
  } catch (error: any) {
    console.error('Equip Title Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
