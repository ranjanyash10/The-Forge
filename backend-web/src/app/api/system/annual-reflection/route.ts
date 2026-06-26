import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-id'

    // Check if user exists, if not create a demo user to avoid prisma errors
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'demo@theforge.xyz',
          username: 'demo_user',
          password_hash: 'demo-hash',
          current_title: 'Wanderer'
        }
      })
    }

    // Check if character exists, if not create a demo character
    let character = await prisma.character.findUnique({
      where: { user_id: userId }
    })
    if (!character) {
      character = await prisma.character.create({
        data: {
          user_id: userId,
          name: 'Demo Architect',
          class: 'The Cyber-Monarch',
          origin_story: 'Forged in obsidian flames, destined to build digital worlds.',
          avatar_url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=demo&backgroundColor=0f172a',
          current_rank: 'E',
          state_json: JSON.stringify({
            attributes: {
              "Strength": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
              "Endurance": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
              "Agility": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
              "Vitality": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
              "Focus": { "level": 12, "xp": 0, "trend": "Stable", "title": "Deep Thinker" },
              "Knowledge": { "level": 11, "xp": 0, "trend": "Stable", "title": null },
              "Creativity": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
              "Resilience": { "level": 12, "xp": 0, "trend": "Stable", "title": "Sturdy" },
              "Charisma": { "level": 8, "xp": 0, "trend": "Stable", "title": null }
            },
            dynamicStates: {
              "energy": 80,
              "stress": 30,
              "confidence": 75,
              "fulfillment": 60,
              "motivation": 85
            },
            values: ["Learning", "Freedom"],
            historyLogs: []
          }),
          momentum: 50
        }
      })
    }

    // 1. Check if user already has an ANNUAL_REFLECTION entry
    let annualReflection = await prisma.codexEntry.findFirst({
      where: { userId, type: 'ANNUAL_REFLECTION' }
    })

    // 2. If no entries exist, seed the mock data for demonstration
    const entryCount = await prisma.codexEntry.count({
      where: { userId }
    })

    if (entryCount === 0) {
      console.log('Seeding mock Codex data for user:', userId)
      
      // Seed a self-limiting belief dated exactly one year ago
      await prisma.codexEntry.create({
        data: {
          userId,
          type: 'BELIEF',
          importance: 'HIGH',
          narrativeState: 'The user operates under a self-limiting narrative that they lack structural cognitive readiness for backend and smart contract architecture.',
          rawUserQuote: "I'm terrible with deep logic. I've failed to learn Solidity or complete any complex backend architectures, and I'll likely never build a production-grade system.",
          isChallenged: false,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      })

      // Seed 4 turning points over the past year
      const turningPointsData = [
        {
          type: 'TURNING_POINT',
          importance: 'HIGH',
          narrativeState: 'The user successfully deployed a smart contract to Sepolia testnet.',
          rawUserQuote: 'Completed my first fully verified Solidity smart contract deployment on Sepolia.',
          isChallenged: false,
          createdAt: new Date(Date.now() - 270 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'TURNING_POINT',
          importance: 'EPIC',
          narrativeState: 'The user successfully implemented asynchronous task processing.',
          rawUserQuote: 'Designed and integrated the main Redis queue system for handling asynchronous task workers.',
          isChallenged: false,
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'TURNING_POINT',
          importance: 'LEGENDARY',
          narrativeState: 'The user defeated the nicotine addiction habit loop.',
          rawUserQuote: 'Conquered the Break the Chain nicotine severance battle: 30 days clean.',
          isChallenged: false,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'TURNING_POINT',
          importance: 'EPIC',
          narrativeState: 'The user completed a high-stakes cross-platform codebase rewrite.',
          rawUserQuote: 'Refactored the entire project structure from React Native to production-grade Flutter in 3 weeks.',
          isChallenged: false,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
      ]

      for (const tp of turningPointsData) {
        await prisma.codexEntry.create({
          data: {
            userId,
            type: tp.type,
            importance: tp.importance,
            narrativeState: tp.narrativeState,
            rawUserQuote: tp.rawUserQuote,
            isChallenged: tp.isChallenged,
            createdAt: tp.createdAt
          }
        })
      }
    }

    // 3. Find the past belief (oldest BELIEF entry or belief from ~365 days ago)
    const pastBelief = await prisma.codexEntry.findFirst({
      where: {
        userId,
        type: 'BELIEF'
      },
      orderBy: { createdAt: 'asc' }
    })

    const pastBeliefQuote = pastBelief
      ? pastBelief.rawUserQuote
      : "I'm terrible with deep logic. I've failed to learn Solidity or complete any complex backend architectures, and I'll likely never build a production-grade system."

    const pastBeliefDate = pastBelief
      ? pastBelief.createdAt
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    // 4. Fetch turning points from the past year
    const turningPoints = await prisma.codexEntry.findMany({
      where: {
        userId,
        type: 'TURNING_POINT',
        createdAt: {
          gte: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const turningPointQuotes = turningPoints.map((tp) => tp.rawUserQuote)

    // 5. Generate or retrieve the reflection analysis
    let analysisText = ''
    if (annualReflection) {
      analysisText = annualReflection.narrativeState
    } else {
      analysisText = await SystemAI.generateAnnualReflectionAnalysis(pastBeliefQuote, turningPointQuotes)
      
      // Save it as a cached ANNUAL_REFLECTION entry
      annualReflection = await prisma.codexEntry.create({
        data: {
          userId,
          type: 'ANNUAL_REFLECTION',
          importance: 'LEGENDARY',
          rawUserQuote: pastBeliefQuote,
          narrativeState: analysisText,
          linkedEntities: JSON.stringify(turningPoints.map(tp => tp.id)),
          createdAt: new Date()
        }
      })
    }

    return NextResponse.json({
      id: annualReflection.id,
      pastBeliefQuote: annualReflection.rawUserQuote,
      pastBeliefDate: pastBeliefDate,
      analysis: analysisText,
      turningPoints: turningPoints.map(tp => ({
        id: tp.id,
        quote: tp.rawUserQuote,
        summary: tp.narrativeState,
        importance: tp.importance,
        createdAt: tp.createdAt
      }))
    })
  } catch (error: any) {
    console.error('Annual Reflection API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
