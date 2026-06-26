import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    let messages = await prisma.systemMessage.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' }
    })

    if (messages.length === 0) {
      const character = await prisma.character.findUnique({
        where: { user_id: userId }
      })

      if (!character) {
        // Initialize conversational onboarding
        const welcome = await prisma.systemMessage.create({
          data: {
            user_id: userId,
            sender: 'SYSTEM',
            content: "Welcome to The Forge. Before a character can be forged... I need to understand who stands before me."
          }
        })
        messages = [welcome]
      }
    }

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Fetch System History Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
