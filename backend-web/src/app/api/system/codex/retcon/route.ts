import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', entryId, newImportance, retconReason } = body

    if (!entryId || !newImportance || !retconReason) {
      return NextResponse.json({ error: 'Entry ID, new importance, and retcon reason are required' }, { status: 400 })
    }

    // 1. Look up Codex entry
    const entry = await prisma.codexEntry.findFirst({
      where: { id: entryId, userId }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Codex entry not found' }, { status: 404 })
    }

    // 2. Perform retcon updates
    const updatedEntry = await prisma.codexEntry.update({
      where: { id: entryId },
      data: {
        isRetconned: true,
        importance: newImportance,
        retconReason: retconReason
      }
    })

    return NextResponse.json({
      success: true,
      entry: updatedEntry
    })
  } catch (error: any) {
    console.error('Retcon API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
