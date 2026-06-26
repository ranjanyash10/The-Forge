import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SystemAI } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId = 'demo-user-id', message } = body

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Save the user's message
    await prisma.systemMessage.create({
      data: {
        user_id: userId,
        sender: 'USER',
        content: message
      }
    })

    // Fetch conversation history
    const history = await prisma.systemMessage.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' }
    })

    // Check if character already exists for this user
    let character = await prisma.character.findUnique({
      where: { user_id: userId }
    })

    const userMessageCount = history.filter(m => m.sender === 'USER').length

    // ----------------------------------------------------
    // CASE A: ONBOARDING CHARACTER ASSESSMENT PHASE
    // ----------------------------------------------------
    if (!character) {
      // If we haven't reached the 10-message conversational onboarding threshold, generate follow-up question
      if (userMessageCount < 10) {
        const nextQuestion = await SystemAI.generateOnboardingQuestion(
          history.map(m => ({ sender: m.sender as 'SYSTEM' | 'USER', content: m.content }))
        )
        
        // Save the system's onboarding question
        const savedMsg = await prisma.systemMessage.create({
          data: {
            user_id: userId,
            sender: 'SYSTEM',
            content: nextQuestion
          }
        })

        return NextResponse.json({ 
          reply: nextQuestion, 
          finished: false,
          progress: Math.round((userMessageCount / 10) * 100)
        })
      } else {
        // Threshold reached! Run full conversational analysis
        const analysis = await SystemAI.analyzeConversationalCharacter(
          history.map(m => ({ sender: m.sender as 'SYSTEM' | 'USER', content: m.content }))
        )
        
        // Infer a basic character name if not provided
        const user = await prisma.user.findUnique({ where: { id: userId } })
        const charName = user ? `${user.username}'s Avatar` : "Recruit"

        const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/png?seed=${encodeURIComponent(analysis.class)}&backgroundColor=0f172a`

        // Prepare the initial states JSON representation
        const initialState = {
          attributes: analysis.attributes || {
            "Strength": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Endurance": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Agility": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Vitality": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Focus": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Knowledge": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Creativity": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Resilience": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
            "Charisma": { "level": 10, "xp": 0, "trend": "Stable", "title": null }
          },
          dynamicStates: {
            "energy": 80,
            "stress": 30,
            "confidence": 75,
            "fulfillment": 60,
            "motivation": 85
          },
          values: analysis.values || ["Growth", "Discipline"],
          historyLogs: []
        }

        // Create the character
        character = await prisma.character.create({
          data: {
            user_id: userId,
            name: charName,
            class: analysis.class,
            origin_story: analysis.biography,
            avatar_url: defaultAvatar,
            current_rank: 'E',
            state_json: JSON.stringify(initialState),
            momentum: 50
          }
        })

        // Create Snapshots
        await prisma.characterSnapshot.create({
          data: {
            character_id: character.id,
            avatar_url: defaultAvatar,
            rank: 'E',
            level: 1,
            title: 'Wanderer',
            narrative: analysis.biography,
            momentum: 50
          }
        })

        // Insert starting skills
        if (analysis.initialSkills && Array.isArray(analysis.initialSkills)) {
          for (const sk of analysis.initialSkills) {
            await prisma.skill.create({
              data: {
                user_id: userId,
                name: sk.name,
                category: sk.category,
                description: sk.description,
                xp: 0,
                level: 1
              }
            }).catch(err => console.error('Failed skill insertion:', err))
          }
        }

        // Insert starting quests (with reason assigned)
        if (analysis.initialQuests && Array.isArray(analysis.initialQuests)) {
          for (const q of analysis.initialQuests) {
            await prisma.quest.create({
              data: {
                user_id: userId,
                title: q.title,
                description: q.description,
                quest_type: q.quest_type,
                difficulty: q.difficulty,
                xp_reward: q.xp_reward,
                reason: q.reason || "Determined by your initial assessment.",
                status: 'ACTIVE'
              }
            }).catch(err => console.error('Failed quest insertion:', err))
          }
        }

        // Save closing greeting to the history
        const analysisGreeting = `INITIAL CHARACTER ANALYSIS COMPLETE.\n\n` +
          `Class: ${analysis.class}\n` +
          `Archetype: ${analysis.archetype}\n` +
          `Biography: "${analysis.biography}"\n\n` +
          `Your core values are identified as: ${initialState.values.join(', ')}.\n` +
          `Starting Attributes: Focus (LVL ${initialState.attributes.Focus.level}), Knowledge (LVL ${initialState.attributes.Knowledge.level}), Strength (LVL ${initialState.attributes.Strength.level}), Resilience (LVL ${initialState.attributes.Resilience.level}).\n\n` +
          `I have updated your Codex and Quest Log. Prepare to step forward into The Forge.`

        await prisma.systemMessage.create({
          data: {
            user_id: userId,
            sender: 'SYSTEM',
            content: analysisGreeting
          }
        })

        // Set default title
        await prisma.user.update({
          where: { id: userId },
          data: { current_title: 'Wanderer' }
        })

        return NextResponse.json({
          reply: analysisGreeting,
          finished: true,
          analysis: {
            class: analysis.class,
            biography: analysis.biography,
            attributes: initialState.attributes,
            values: initialState.values
          }
        })
      }
    }

    // ----------------------------------------------------
    // CASE B: CONTINUOUS DISCOVERY & GM CHAT LOOP
    // ----------------------------------------------------
    const currentJson = character.state_json || '{}'
    const systemResponse = await SystemAI.processSystemChat(
      message,
      history.map(m => ({ sender: m.sender as 'SYSTEM' | 'USER', content: m.content })),
      currentJson
    )

    // Extract Codex entries from user message
    try {
      const extracted = await SystemAI.extractCodexEntries(message)
      if (extracted && extracted.length > 0) {
        for (const entry of extracted) {
          await prisma.codexEntry.create({
            data: {
              userId: userId,
              type: entry.type,
              importance: entry.importance || 'COMMON',
              narrativeState: entry.narrativeState,
              rawUserQuote: entry.rawUserQuote || message,
              isChallenged: false,
              linkedEntities: JSON.stringify(entry.linked_entities || { skills: [], attributes: [] })
            }
          })
        }
      }
    } catch (codexError) {
      console.error('Codex Extraction Error in Chat Route:', codexError)
    }

    // Save System message
    await prisma.systemMessage.create({
      data: {
        user_id: userId,
        sender: 'SYSTEM',
        content: systemResponse.reply
      }
    })

    // Update state_json with the dynamic updates from AI (states, values, goals, etc.)
    let parsedState = { attributes: {}, dynamicStates: {}, values: [], historyLogs: [] }
    try {
      parsedState = JSON.parse(currentJson)
    } catch (e) {}

    if (systemResponse.stateUpdate) {
      parsedState.dynamicStates = {
        ...parsedState.dynamicStates,
        ...systemResponse.stateUpdate
      }
    }

    await prisma.character.update({
      where: { id: character.id },
      data: {
        state_json: JSON.stringify(parsedState)
      }
    })

    // If there are new quests, save them
    if (systemResponse.newQuests && Array.isArray(systemResponse.newQuests)) {
      for (const q of systemResponse.newQuests) {
        await prisma.quest.create({
          data: {
            user_id: userId,
            title: q.title,
            description: q.description,
            quest_type: q.quest_type,
            difficulty: q.difficulty,
            xp_reward: q.xp_reward,
            reason: q.reason || "Assigned by the Game Master dynamically in conversation.",
            status: 'ACTIVE'
          }
        }).catch(err => console.error('Failed dynamic quest creation:', err))
      }
    }

    return NextResponse.json({
      reply: systemResponse.reply,
      finished: true
    })
  } catch (error: any) {
    console.error('System Chat API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
