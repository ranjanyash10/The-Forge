import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    // Fetch user's daily logs
    const logs = await prisma.dailyLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10 // scanning the last 10 logs is robust and fits context limits perfectly
    })

    const logTexts = logs.map(l => l.notes)

    // Call SystemAI emergence evaluation
    const evaluation = await SystemAI.evaluateEmergentBoss(logTexts)

    return NextResponse.json({ evaluation })
  } catch (error: any) {
    console.error('Emergence Scanner Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
