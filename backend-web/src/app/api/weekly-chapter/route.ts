import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    const chapters = await prisma.weeklyChapter.findMany({
      where: { user_id: userId },
      orderBy: { chapter_number: 'desc' }
    })

    return NextResponse.json({ chapters })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id' } = body

    // 1. Fetch logs from the last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const logs = await prisma.dailyLog.findMany({
      where: {
        user_id: userId,
        created_at: { gte: oneWeekAgo }
      },
      orderBy: { created_at: 'asc' }
    })

    if (logs.length === 0) {
      return NextResponse.json({ error: 'No logs found in the last 7 days to compile a chapter.' }, { status: 400 })
    }

    const logTexts = logs.map(l => l.notes)

    // 2. Sum up XP gained in the last 7 days
    const transactions = await prisma.xPTransaction.findMany({
      where: {
        user_id: userId,
        created_at: { gte: oneWeekAgo }
      }
    })
    const totalXp = transactions.reduce((sum, t) => sum + t.xp_amount, 0)

    // 3. Determine Chapter Number
    const currentChapterCount = await prisma.weeklyChapter.count({
      where: { user_id: userId }
    })
    const nextChapterNumber = currentChapterCount + 1

    // 4. Run System AI to generate Chapter Title & Narrative
    const chapterAiResult = await SystemAI.generateWeeklyChapter(nextChapterNumber, logTexts, totalXp)

    // 5. Create Chapter in database
    const newChapter = await prisma.weeklyChapter.create({
      data: {
        user_id: userId,
        chapter_number: nextChapterNumber,
        title: chapterAiResult.title,
        narrative: chapterAiResult.narrative
      }
    })

    // 6. Generate a CharacterSnapshot at the end of the week
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { character: true, skills: true }
    })

    if (user && user.character) {
      const skillsSummary = user.skills.map(s => `${s.name} Lvl ${s.level} Rank ${s.rank}`).join(', ')
      await prisma.characterSnapshot.create({
        data: {
          character_id: user.character.id,
          avatar_url: user.character.avatar_url,
          rank: user.character.current_rank,
          level: user.global_level,
          title: user.current_title || 'Wanderer',
          narrative: `Completed Chapter ${nextChapterNumber}: ${chapterAiResult.title}. Unlocked skills: ${skillsSummary}.`
        }
      })
    }

    return NextResponse.json({ success: true, chapter: newChapter })
  } catch (error: any) {
    console.error('Weekly Chapter Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
