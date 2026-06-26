import OpenAI from 'openai'

// Initialize OpenAI client if key is available
const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

export interface InitialSkill {
  name: string
  category: 'BODY' | 'WEALTH' | 'MIND' | 'INFLUENCE'
  description: string
}

export interface InitialQuest {
  title: string
  description: string
  quest_type: 'MAIN' | 'SIDE' | 'ELITE' | 'BOSS' | 'PRIORITY' | 'OPPORTUNITY'
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  xp_reward: number
  reason?: string
}

interface CharacterResult {
  class: string
  archetype: string
  biography: string
  avatarPrompt: string
  initialSkills: InitialSkill[]
  initialQuests: InitialQuest[]
}

interface SkillDiscoveryResult {
  name: string
  category: 'BODY' | 'WEALTH' | 'MIND' | 'INFLUENCE'
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  description: string
}

interface XPAlloc {
  skillName: string
  xp: number
  reason: string
}

interface DailyQuestSuggest {
  title: string
  description: string
  difficulty: string
  xp_reward: number
  quest_type: 'MAIN' | 'SIDE' | 'ELITE' | 'BOSS' | 'PRIORITY' | 'OPPORTUNITY'
  reason?: string
}

interface DailyAnalysisResult {
  analysis: string
  xpTransactions: XPAlloc[]
  suggestedQuests: DailyQuestSuggest[]
  strengths: string
  weaknesses: string
}

interface WeeklyChapterResult {
  title: string
  narrative: string
}

export const SystemAI = {
  /**
   * Character generation helper
   */
  async generateCharacter(name: string, bioRaw: string, aspirations: string, strengths: string, weaknesses: string): Promise<CharacterResult> {
    const prompt = `You are THE SYSTEM. You evaluate candidates entering The Forge and define their alter ego character.
Tone: Aspirational, epic, legendary, meaningful, and rewarding. Never cringe or overly childish. Act as a solemn guide.

Evaluate the following candidate details:
Name: ${name}
Details: ${bioRaw}
Aspirations: ${aspirations}
Strengths: ${strengths}
Weaknesses: ${weaknesses}

Based on these details, you must also determine:
1. Two starting skills (InitialSkills) that align with their aspirations and strengths. Each skill category must be one of: BODY, WEALTH, MIND, INFLUENCE.
2. Two or three initial active quests (InitialQuests) that align with their aspirations, strengths, and weaknesses. Each quest should have:
   - title (epic, action-oriented)
   - description (clear real-life action)
   - quest_type (MAIN, SIDE, ELITE)
   - difficulty (E, D, C, B, A, S)
   - xp_reward (numerical value matching difficulty, e.g. E: 20-30, D: 40-50, C: 60-80, B: 100-120, A: 150-180, S: 200+)

Respond in strict JSON format with these exact fields:
{
  "class": "Name of character class (e.g. The Scholar-King, The Cyber-Monarch, The Iron Gladiator)",
  "archetype": "Brief core archetype classification (e.g. Builder, Sovereign, Warrior, Hunter)",
  "biography": "A short, epic 3-4 sentence narrative biography outlining their potential. Do not simply restate their inputs; write high-quality, tasteful, progress-fantasy prose describing their transition. Focus on al the strengths and weaknesses and what they aspire to do. Study the words like an llm and respond.",
  "avatarPrompt": "A highly detailed text-to-image prompt to generate an avatar portrait for this character in DALL-E, focusing on glowing runes, RPG aesthetic, premium illustration, and dark atmospheric lighting",
  "initialSkills": [
    {
      "name": "Skill Name",
      "category": "BODY | WEALTH | MIND | INFLUENCE",
      "description": "Short, epic description of what this skill represents in their path"
    }
  ],
  "initialQuests": [
    {
      "title": "Quest Title",
      "description": "Quest objective and what they must complete in the real world",
      "quest_type": "MAIN | SIDE | ELITE | BOSS",
      "difficulty": "E | D | C | B | A | S",
      "xp_reward": 50
    }
  ]
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}') as CharacterResult
      } catch (e) {
        console.error('OpenAI Error, fallback triggered:', e)
      }
    }

    // Heuristic analysis of input details to synthesize a highly customized character sheet
    const cleanAsp = aspirations.toLowerCase()
    const cleanStr = strengths.toLowerCase()
    const cleanWk = weaknesses.toLowerCase()
    const cleanName = name.trim()

    // Determine target domains
    const isWealth = cleanAsp.includes('saas') || cleanAsp.includes('dev') || cleanAsp.includes('code') || cleanAsp.includes('program') || cleanAsp.includes('millionaire') || cleanAsp.includes('business') || cleanAsp.includes('money') || cleanAsp.includes('startup') || cleanAsp.includes('finance') || cleanAsp.includes('wealth') || cleanStr.includes('code') || cleanStr.includes('dev')

    const isBody = cleanAsp.includes('shredded') || cleanAsp.includes('mma') || cleanAsp.includes('workout') || cleanAsp.includes('gym') || cleanAsp.includes('fitness') || cleanAsp.includes('muscle') || cleanAsp.includes('strength') || cleanAsp.includes('box') || cleanAsp.includes('fight') || cleanAsp.includes('run') || cleanWk.includes('fat') || cleanWk.includes('weight') || cleanWk.includes('lazy')

    const isInfluence = cleanAsp.includes('charismatic') || cleanAsp.includes('lead') || cleanAsp.includes('speak') || cleanAsp.includes('talk') || cleanAsp.includes('network') || cleanAsp.includes('people') || cleanAsp.includes('relationship') || cleanAsp.includes('influence')

    const isMind = cleanAsp.includes('thinker') || cleanAsp.includes('learn') || cleanAsp.includes('study') || cleanAsp.includes('read') || cleanAsp.includes('focus') || cleanAsp.includes('concentration') || cleanAsp.includes('discipline') || cleanStr.includes('discipline') || cleanStr.includes('focus') || cleanWk.includes('motivation') || cleanWk.includes('focus')

    // 1. Determine Class & Archetype
    let selectedClass = 'The Ascendant Voyager'
    let selectedArchetype = 'Ascendant Wanderer'
    let avatarPromptColor = 'amethyst and silver'

    if (isWealth && isBody) {
      selectedClass = 'The Sovereign Titan'
      selectedArchetype = 'Vanguard Founder'
      avatarPromptColor = 'emerald and dark metallic gold'
    } else if (isWealth && isMind) {
      selectedClass = 'The Cyber-Monarch'
      selectedArchetype = 'Sovereign Builder'
      avatarPromptColor = 'sapphire and neon cyan'
    } else if (isWealth && isInfluence) {
      selectedClass = 'The Venture Architect'
      selectedArchetype = 'Apex Pioneer'
      avatarPromptColor = 'gold and platinum'
    } else if (isBody && isInfluence) {
      selectedClass = 'The Gladiatorial Commander'
      selectedArchetype = 'Iron Warlord'
      avatarPromptColor = 'crimson and bronze'
    } else if (isBody && isMind) {
      selectedClass = 'The Strategic Sentinel'
      selectedArchetype = 'Unbroken Scholar'
      avatarPromptColor = 'deep obsidian and electric purple'
    } else if (isMind && isInfluence) {
      selectedClass = 'The Ascendant Consul'
      selectedArchetype = 'Master Strategist'
      avatarPromptColor = 'royal violet and white jade'
    } else if (isWealth) {
      selectedClass = 'The Ledger Architect'
      selectedArchetype = 'Wealth Alchemist'
      avatarPromptColor = 'amber and brass'
    } else if (isBody) {
      selectedClass = 'The Iron Titan'
      selectedArchetype = 'Vanguard Gladiator'
      avatarPromptColor = 'molten crimson and dark steel'
    } else if (isMind) {
      selectedClass = 'The Obsidian Scholar'
      selectedArchetype = 'Chronology Sage'
      avatarPromptColor = 'deep teal and indigo'
    } else if (isInfluence) {
      selectedClass = 'The Gilded Diplomat'
      selectedArchetype = 'Apex Sovereign'
      avatarPromptColor = 'rose gold and ivory'
    }

    // 2. Compose Tasteful Biography
    const baseAspiration = aspirations ? aspirations.split(',')[0].trim() : 'greatness'
    const baseStrength = strengths ? strengths.split(',')[0].trim() : 'unshakeable resolve'
    const baseWeakness = weaknesses ? weaknesses.split(',')[0].trim() : 'unrefined habits'

    const biography = `Entering The Forge as ${selectedClass}, this candidate carries the blueprint of a rare resolve. Wielding ${baseStrength} as their initial foundation, they seek to manifest their vision of becoming ${baseAspiration}. Yet, to claim their sovereign rank, they must confront and conquer the shadow of their ${baseWeakness}. The anvil is set; their true form awaits the strike of action.`

    // 3. Determine Initial Skills
    const initialSkills: InitialSkill[] = []

    if (isWealth) {
      initialSkills.push({
        name: 'SaaS Synthesis',
        category: 'WEALTH',
        description: 'The art of building digital products and architectures that leverage code to create value.'
      })
    }
    if (isBody) {
      initialSkills.push({
        name: 'Kinetic Conditioning',
        category: 'BODY',
        description: 'Refinement of physical mechanics, cardiovascular reserve, and explosive power through strict conditioning.'
      })
    }
    if (isMind || initialSkills.length < 2) {
      initialSkills.push({
        name: 'Cognitive Focus',
        category: 'MIND',
        description: 'Strengthening mental clarity, deep work blocks, and resistance to impulsive procrastination.'
      })
    }
    if (isInfluence && initialSkills.length < 2) {
      if (initialSkills.length === 2) initialSkills.pop()
      initialSkills.push({
        name: 'Magnetic Rhetoric',
        category: 'INFLUENCE',
        description: 'Projecting authority and charismatic resonance in all human interactions and leadership.'
      })
    }

    if (initialSkills.length < 2) {
      initialSkills.push({
        name: 'System Synchronization',
        category: 'MIND',
        description: 'Maintaining focus and tracking daily habits against the Forge\'s progression systems.'
      })
    }

    // 4. Determine Initial Quests
    const initialQuests: InitialQuest[] = []

    if (isWealth) {
      initialQuests.push({
        title: 'Architect the MVP',
        description: 'Define the core problem statement, database schema, and initial tech stack for your digital project.',
        quest_type: 'MAIN',
        difficulty: 'D',
        xp_reward: 50
      })
      initialQuests.push({
        title: 'Deep Focus Sprint',
        description: 'Execute a 90-minute uninterrupted block of design, code, or business strategy.',
        quest_type: 'SIDE',
        difficulty: 'E',
        xp_reward: 25
      })
    }
    if (isBody) {
      initialQuests.push({
        title: 'Iron Drill Initiation',
        description: 'Complete a highly focused 45-minute athletic training, boxing, or MMA drills session.',
        quest_type: 'MAIN',
        difficulty: 'D',
        xp_reward: 50
      })
      initialQuests.push({
        title: 'Macronutrient Blueprint',
        description: 'Log everything you consume today, strictly hit your caloric goal, and eliminate refined sugar.',
        quest_type: 'SIDE',
        difficulty: 'E',
        xp_reward: 20
      })
    }
    if (isMind || initialQuests.length < 3) {
      initialQuests.push({
        title: 'Vigilant Mind Protocol',
        description: 'Complete a 15-minute silent breathing or mental mapping block to train focus and ego resistance.',
        quest_type: 'SIDE',
        difficulty: 'E',
        xp_reward: 20
      })
    }
    if (isInfluence && initialQuests.length < 3) {
      initialQuests.push({
        title: 'Monarch Interaction',
        description: 'Reach out to or network with one key candidate or mentor in your target industry field.',
        quest_type: 'SIDE',
        difficulty: 'C',
        xp_reward: 40
      })
    }

    if (initialQuests.length > 3) {
      initialQuests.splice(3)
    }
    while (initialQuests.length < 3) {
      initialQuests.push({
        title: 'Establish the Path',
        description: 'Document and define your 3 primary micro-goals for the current week.',
        quest_type: 'SIDE',
        difficulty: 'E',
        xp_reward: 20
      })
    }

    const avatarPrompt = `A stunning, high-end illustration of ${name} as a legendary ${selectedClass.toLowerCase()} with glowing ${avatarPromptColor} armor, detailed RPG portrait art style, and a solo leveling aura.`

    return {
      class: selectedClass,
      archetype: selectedArchetype,
      biography,
      avatarPrompt,
      initialSkills,
      initialQuests
    }
  },

  /**
   * Skill discovery evaluator
   */
  async discoverSkill(skillRequest: string): Promise<SkillDiscoveryResult> {
    const prompt = `You are THE SYSTEM. The user wants to discover a new skill to pursue in real life.
Analyze their query: "${skillRequest}"

Determine:
1. Category: Must be one of: BODY, WEALTH, MIND, INFLUENCE.
2. Difficulty: Must be one of: E, D, C, B, A, S (E is easiest, S is legendary).
3. Think what the skill is about and how it can affect the user then give brief, epic description of the skill in RPG terms.

Respond in strict JSON format:
{
  "name": "Proper capitalized name of the skill",
  "category": "BODY | WEALTH | MIND | INFLUENCE",
  "difficulty": "E | D | C | B | A | S",
  "description": "Short, immersive, epic description of what this skill unlocks in the user's path"
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}') as SkillDiscoveryResult
      } catch (e) {
        console.error('OpenAI Error, fallback triggered:', e)
      }
    }

    // Fallback generator
    let category: 'BODY' | 'WEALTH' | 'MIND' | 'INFLUENCE' = 'MIND'
    let difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' = 'D'
    const cleanRequest = skillRequest.toLowerCase()

    if (cleanRequest.includes('speak') || cleanRequest.includes('talk') || cleanRequest.includes('lead') || cleanRequest.includes('network')) {
      category = 'INFLUENCE'
      difficulty = 'C'
    } else if (cleanRequest.includes('run') || cleanRequest.includes('lift') || cleanRequest.includes('workout') || cleanRequest.includes('box') || cleanRequest.includes('fight')) {
      category = 'BODY'
      difficulty = 'D'
    } else if (cleanRequest.includes('money') || cleanRequest.includes('sales') || cleanRequest.includes('saas') || cleanRequest.includes('business')) {
      category = 'WEALTH'
      difficulty = 'B'
    }

    return {
      name: skillRequest.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category,
      difficulty,
      description: `The path of ${skillRequest}. Dedicated refinement in this domain alters the candidate's capacity to dictate reality.`
    }
  },

  /**
   * Daily journal analyser
   */
  async analyzeDailyLog(notes: string, mood: string, energy: number, existingSkills: string[]): Promise<DailyAnalysisResult> {
    const prompt = `You are THE SYSTEM. A candidate has submitted their chronicle for today:
"${notes}"
Mood: ${mood}
Energy Level: ${energy}/10
Currently tracked skills: ${existingSkills.join(', ')}

Analyze their progress and generate:
1. A solemn, epic narrative review of their day (2-3 sentences), describing their deeds in RPG style (e.g. "The Monarch conquered code block structures today, forging stable schemas...").
2. XP Transactions: Allocate logical XP (from +10 to +150 depending on difficulty of actions) to relevant skills from the existing list, or suggest general Global XP if it doesn't fit existing ones. Include a reason for each.
3. Suggested Quests: Suggest 2 actionable quests for tomorrow based on weaknesses, aspirations, or follow-ups.
4. Highlight today's strength and today's weakness.

Respond in strict JSON format:
{
  "analysis": "Epic narration...",
  "xpTransactions": [
    { "skillName": "Name of Skill (must match one of the existing or general)", "xp": 50, "reason": "Completed..." }
  ],
  "suggestedQuests": [
    { "title": "Quest Title", "description": "Quest objective...", "difficulty": "E-S", "xp_reward": 25, "quest_type": "MAIN | SIDE | ELITE" }
  ],
  "strengths": "Today's strength...",
  "weaknesses": "Today's weakness..."
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}') as DailyAnalysisResult
      } catch (e) {
        console.error('OpenAI Error, fallback triggered:', e)
      }
    }

    // Fallback generator
    const matchedSkill = existingSkills.length > 0 ? existingSkills[0] : 'General'
    return {
      analysis: `Through focus and intent, the candidate logged deeds of discipline. Challenges were faced directly, reinforcing the resolve of their character.`,
      xpTransactions: [
        { skillName: matchedSkill, xp: 50, reason: `Demonstrated progression in: ${notes.slice(0, 30)}...` }
      ],
      suggestedQuests: [
        { title: 'Maintain Momentum', description: 'Log tomorrow\'s actions with equal or greater intensity.', difficulty: 'E', xp_reward: 20, quest_type: 'SIDE' },
        { title: 'Conquer the Complex', description: 'Address a highly deferred task in your main archetype.', difficulty: 'C', xp_reward: 50, quest_type: 'MAIN' }
      ],
      strengths: 'Consistent accountability and logging of reality.',
      weaknesses: 'Energy optimization requires close observation.'
    }
  },

  /**
   * Weekly chapter writer
   */
  async generateWeeklyChapter(chapterNumber: number, logs: string[], xpSum: number): Promise<WeeklyChapterResult> {
    const prompt = `You are THE SYSTEM. Write the weekly chronicle chapter for the candidate.
Chapter Number: ${chapterNumber}
Total XP Gained this week: ${xpSum}
Daily logs from this week:
${logs.map((l, i) => `- Day ${i + 1}: ${l}`).join('\n')}

Synthesize this data into:
1. An epic chapter title (e.g. "The Rebuild", "Friction and Fuel", "Breaching the Gates").
2. A high-quality narrative (150-250 words) reading like a progression fantasy novel chapter. Describe their struggles, milestones, and growing power. Highlight the significance of their actions.

Respond in strict JSON format:
{
  "title": "Chapter Title",
  "narrative": "Narrative body..."
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}') as WeeklyChapterResult
      } catch (e) {
        console.error('OpenAI Error, fallback triggered:', e)
      }
    }

    // Fallback generator
    const titles = ['Friction and Fuel', 'The Awakening Arc', 'Erecting Foundations', 'Forging the Spirit']
    const title = titles[chapterNumber % titles.length]
    return {
      title: `Chapter ${chapterNumber}: ${title}`,
      narrative: `The candidate amassed a total of ${xpSum} XP over this era. Each action, though quiet in the physical world, echoed inside The Forge. The character adapts, muscles tightening and cognitive patterns aligning. With new quests on the horizon, the horizon expands. The legend grows deeper.`
    }
  },

  async generateOnboardingQuestion(history: Array<{ sender: 'SYSTEM' | 'USER', content: string }>): Promise<string> {
    const prompt = `You are THE SYSTEM, a Game Master guiding a player through their initial character assessment in The Forge.
We are conducting conversational onboarding (aiming for 8-12 questions total). The player has just replied.
Your task is to generate the next deep, meaningful question based on the history.
Rules:
- NEVER ask survey-like questions (e.g. "On a scale of 1-10...").
- Keep it natural, conversational, and in character (RPG tone).
- Address their previous response dynamically and ask a follow-up that helps discover:
  - Why they joined The Forge
  - Current goals
  - Biggest obstacles / weaknesses
  - Existing strengths
  - Core values (e.g. freedom, family, growth)
  - Priorities
- Do not answer their question or provide a report yet. Only ask ONE question.

Here is the conversation history:
${history.map(m => `${m.sender}: "${m.content}"`).join('\n')}

System (generate next question):`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
        return response.choices[0].message.content || 'What is the main driver behind your actions today?'
      } catch (e) {
        console.error('OpenAI generateOnboardingQuestion error, using fallback:', e)
      }
    }

    const userMsgCount = history.filter(m => m.sender === 'USER').length
    const questions = [
      "Before a character can be forged... I need to understand who stands before me. What is the single biggest aspiration driving you to enter The Forge?",
      "To manifest this, action must meet focus. What has been your greatest strength in achieving your goals so far?",
      "Every hero carries a shadow. What is the biggest obstacle or weakness that repeatedly breaks your momentum?",
      "Let's look at the physical container. Do you have specific targets for your body, weight, or daily physical conditioning?",
      "Values are the anchor of progression. When you look at family, freedom, wealth, and learning, which of these holds the highest priority in your life?",
      "Interesting. What makes this particular value so critical to you at this stage of your journey?",
      "If you could resolve one conflict or stress point in your daily routine immediately, what would it be?",
      "What is the single most important project or milestone you want to complete over the next three months?",
      "In three words, how would you describe the version of yourself you are striving to become?",
      "Final question: What is the first habit or routine we must rebuild tomorrow morning to kickstart this evolution?"
    ]
    return questions[Math.min(userMsgCount, questions.length - 1)]
  },

  async analyzeConversationalCharacter(history: Array<{ sender: 'SYSTEM' | 'USER', content: string }>): Promise<CharacterResult & { attributes: any, values: string[] }> {
    const prompt = `You are THE SYSTEM. A candidate has completed their conversational onboarding.
You must analyze the entire conversation and synthesize their starting character sheet.

Analyze the conversation history:
${history.map(m => `${m.sender}: "${m.content}"`).join('\n')}

Determine:
1. Class Name (epic, progress-fantasy style, e.g., The Sovereign Builder, The Obsidian Scholar)
2. Archetype Name (e.g. Builder, Sovereign, Warrior, Sage)
3. A short, epic 3-4 sentence narrative biography explaining who they are and who they are becoming.
4. An avatar illustration prompt for DALL-E.
5. Three categories of attributes (Strength, Endurance, Agility, Vitality under PHYSICAL; Focus, Knowledge, Creativity under COGNITIVE; Resilience, Charisma under CHARACTER) initialized with starting levels (between 5 and 15) and starting XP (0) based on their background.
6. A list of 3-5 core values identified from the conversation.
7. Two starting skills aligned with their focus.
8. Two starting active quests (one MAIN quest for their long-term target, and one PRIORITY quest for their immediate milestone).

Respond in strict JSON format:
{
  "class": "Class Name",
  "archetype": "Archetype",
  "biography": "Biography text...",
  "avatarPrompt": "Avatar image prompt...",
  "attributes": {
    "Strength": { "level": 10, "xp": 0, "trend": "Stable", "title": "Acolyte" },
    "Endurance": { "level": 8, "xp": 0, "trend": "Stable", "title": null },
    "Agility": { "level": 9, "xp": 0, "trend": "Stable", "title": null },
    "Vitality": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
    "Focus": { "level": 12, "xp": 0, "trend": "Stable", "title": "Concentration" },
    "Knowledge": { "level": 11, "xp": 0, "trend": "Stable", "title": null },
    "Creativity": { "level": 10, "xp": 0, "trend": "Stable", "title": null },
    "Resilience": { "level": 12, "xp": 0, "trend": "Stable", "title": "Sturdy" },
    "Charisma": { "level": 8, "xp": 0, "trend": "Stable", "title": null }
  },
  "values": ["Freedom", "Family", "Learning"],
  "initialSkills": [
    { "name": "Skill Name", "category": "BODY | WEALTH | MIND | INFLUENCE", "description": "Description..." }
  ],
  "initialQuests": [
    { "title": "Quest Title", "description": "Description...", "quest_type": "MAIN | PRIORITY | SIDE | OPPORTUNITY", "difficulty": "E | D | C | B | A | S", "xp_reward": 100, "reason": "Reason for quest assignment" }
  ]
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch (e) {
        console.error('OpenAI analyzeConversationalCharacter error, using fallback:', e)
      }
    }

    const userTexts = history.filter(m => m.sender === 'USER').map(m => m.content.toLowerCase()).join(' ')
    const isWealth = userTexts.includes('saas') || userTexts.includes('code') || userTexts.includes('dev') || userTexts.includes('business') || userTexts.includes('money') || userTexts.includes('work')
    const isBody = userTexts.includes('gym') || userTexts.includes('fitness') || userTexts.includes('weight') || userTexts.includes('run') || userTexts.includes('box') || userTexts.includes('workout')
    const isMind = userTexts.includes('focus') || userTexts.includes('study') || userTexts.includes('learn') || userTexts.includes('mind') || userTexts.includes('read') || userTexts.includes('discipline')
    const isInfluence = userTexts.includes('charisma') || userTexts.includes('people') || userTexts.includes('lead') || userTexts.includes('relationship') || userTexts.includes('talk')

    let className = 'The Obsidian Scholar'
    let archetype = 'Sage Voyager'
    let bio = "Entering the system after long periods of reflection, the candidate shows signs of high adaptability. Seeking to manifest progress while overcoming passive habits, they forge a path under the watchful eye of The System."
    
    if (isWealth) {
      className = 'The Sovereign Builder'
      archetype = 'Founder'
      bio = "Driven by wealth creation and building digital structures, the candidate has stepped into The Forge to execute plans. Striving to master product synthesis, they must remain focused against daily distractions."
    } else if (isBody) {
      className = 'The Iron Vanguard'
      archetype = 'Warrior'
      bio = "With goals aligned towards physical conditioning and strength, the candidate seeks physical mastery. The Forge will test their endurance and agilities on this journey of physical refinement."
    }

    const strLvl = isBody ? 12 : 8
    const endLvl = isBody ? 11 : 9
    const agiLvl = isBody ? 10 : 8
    const vitLvl = 10
    
    const focLvl = isMind ? 12 : 9
    const knoLvl = isMind || isWealth ? 12 : 9
    const creLvl = isWealth ? 11 : 9
    
    const resLvl = 10
    const chaLvl = isInfluence ? 11 : 8

    return {
      class: className,
      archetype: archetype,
      biography: bio,
      avatarPrompt: `A portrait of ${className}, RPG class card design, glowing purple and teal aura, high detail`,
      attributes: {
        "Strength": { "level": strLvl, "xp": 0, "trend": "Stable", "title": strLvl >= 12 ? "Warrior" : null },
        "Endurance": { "level": endLvl, "xp": 0, "trend": "Stable", "title": null },
        "Agility": { "level": agiLvl, "xp": 0, "trend": "Stable", "title": null },
        "Vitality": { "level": vitLvl, "xp": 0, "trend": "Stable", "title": null },
        "Focus": { "level": focLvl, "xp": 0, "trend": "Stable", "title": focLvl >= 12 ? "Deep Thinker" : null },
        "Knowledge": { "level": knoLvl, "xp": 0, "trend": "Stable", "title": null },
        "Creativity": { "level": creLvl, "xp": 0, "trend": "Stable", "title": null },
        "Resilience": { "level": resLvl, "xp": 0, "trend": "Stable", "title": null },
        "Charisma": { "level": chaLvl, "xp": 0, "trend": "Stable", "title": null }
      },
      values: isWealth ? ["Wealth", "Learning", "Freedom"] : ["Health", "Growth", "Adventure"],
      initialSkills: isWealth ? [
        { name: 'SaaS Synthesis', category: 'WEALTH', description: 'Architecting functional software assets.' }
      ] : [
        { name: 'Physical Conditioning', category: 'BODY', description: 'Rebuilding physical endurance and cellular strength.' }
      ],
      initialQuests: [
        {
          title: isWealth ? 'Code the MVP Core' : 'Execute Morning Routine',
          description: isWealth ? 'Establish the base repository and construct the first user flow.' : 'Wake up at your target hour and complete 15 minutes of dynamic stretching.',
          quest_type: 'MAIN',
          difficulty: 'C',
          xp_reward: 80,
          reason: 'This quest acts as your anchor, setting a foundational milestone matching your primary priority.'
        },
        {
          title: 'Consume 100g Protein',
          description: 'Log and consume high-protein whole foods to ensure recovery.',
          quest_type: 'PRIORITY',
          difficulty: 'D',
          xp_reward: 50,
          reason: 'Your stats show you are targeting physical reconstruction; recovery cannot proceed without raw fuel.'
        }
      ]
    }
  },

  async processSystemChat(message: string, history: Array<{ sender: 'SYSTEM' | 'USER', content: string }>, characterStateJson: string): Promise<{ reply: string, stateUpdate: any, newQuests: InitialQuest[] }> {
    const prompt = `You are THE SYSTEM, a Game Master for The Forge (an RPG progress tracker for developers).
The user is speaking to you about their life, goals, priorities, energy levels, or requesting adjustments.
Tone: Epically descriptive, observant, motivating, guides rather than judges. Avoid dry task-manager dialogue.

Inputs:
User Message: "${message}"
Character State (current attributes, dynamic states, values):
${characterStateJson}

Recent Chat Logs:
${history.slice(-6).map(m => `${m.sender}: "${m.content}"`).join('\n')}

Tasks:
1. Formulate a response in the voice of THE SYSTEM. Do not declare objective truths about them; state observations about their recent patterns.
2. Estimate updates for the 5 dynamic state variables (values 0-100): Energy, Stress, Confidence, Fulfillment, Motivation.
3. Check if the user intends to adjust goals, priority shifts, or requests to add a quest. If so, generate 1-2 new quests (Main, Priority, Side, or Opportunity) with a "reason" explaining why it was assigned.

Respond in strict JSON format:
{
  "reply": "System narrative response...",
  "stateUpdate": {
    "energy": 75,
    "stress": 40,
    "confidence": 70,
    "fulfillment": 60,
    "motivation": 80
  },
  "newQuests": [
    { "title": "Quest Title", "description": "Description...", "quest_type": "MAIN | PRIORITY | SIDE | OPPORTUNITY", "difficulty": "E | D | C | B | A | S", "xp_reward": 50, "reason": "Reason for assignment" }
  ]
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch (e) {
        console.error('OpenAI processSystemChat error, using fallback:', e)
      }
    }

    const cleanMsg = message.toLowerCase()
    let reply = "The signals are clear. Your input has been logged inside the memory matrix. The System evaluates these parameters and adapts your quest directives."
    let dynamicStates = { energy: 70, stress: 40, confidence: 60, fulfillment: 50, motivation: 70 }
    
    try {
      const parsed = JSON.parse(characterStateJson || '{}')
      if (parsed.dynamicStates) dynamicStates = parsed.dynamicStates
    } catch (e) {}

    if (cleanMsg.includes('tire') || cleanMsg.includes('exhaust') || cleanMsg.includes('sleepy') || cleanMsg.includes('sick')) {
      dynamicStates.energy = Math.max(10, dynamicStates.energy - 25)
      dynamicStates.stress = Math.min(100, dynamicStates.stress + 15)
      reply = "THE SYSTEM detects high exhaustion levels. Energy reserves are declining. I recommend prioritizing recovery; running yourself to empty will damage your long-term focus attributes. Take a short pause."
    } else if (cleanMsg.includes('stress') || cleanMsg.includes('anxious') || cleanMsg.includes('worry') || cleanMsg.includes('busy')) {
      dynamicStates.stress = Math.min(100, dynamicStates.stress + 20)
      dynamicStates.motivation = Math.max(20, dynamicStates.motivation - 10)
      reply = "Friction detected inside your network nodes. Your stress levels are elevated. Striving to complete too many priority tasks simultaneously may be causing this blockage. Focus on one simple action next."
    } else if (cleanMsg.includes('success') || cleanMsg.includes('win') || cleanMsg.includes('done') || cleanMsg.includes('achieve')) {
      dynamicStates.confidence = Math.min(100, dynamicStates.confidence + 15)
      dynamicStates.fulfillment = Math.min(100, dynamicStates.fulfillment + 10)
      reply = "A major positive transition recorded. Your confidence index increases. The Forge has observed your momentum and validates this completion. Continue executing."
    }

    const newQuests: InitialQuest[] = []
    if (cleanMsg.includes('quest') || cleanMsg.includes('goal') || cleanMsg.includes('target') || cleanMsg.includes('work') || cleanMsg.includes('run')) {
      newQuests.push({
        title: cleanMsg.includes('run') ? 'Cardio Synchronization' : 'Deep Execution Sprint',
        description: cleanMsg.includes('run') ? 'Complete a 5 km run keeping your heart rate in Zone 2.' : 'Set a timer for 90 minutes of focused work with all notification channels muted.',
        quest_type: 'OPPORTUNITY',
        difficulty: 'D',
        xp_reward: 50,
        reason: 'This opportunity quest was formulated because you indicated a desire to focus on immediate execution tasks.'
      })
    }

    return {
      reply,
      stateUpdate: dynamicStates,
      newQuests
    }
  },

  async analyzeBossBattle(
    title: string,
    estHours: number,
    totalPhases: number,
    dependencies: number,
    historicalSuccessRate: number = 0.8,
    currentEnergy: number = 70,
    attributesReadiness: number = 70,
    skillLevelDelta: number = 0,
    nemesisWeight: number = 0
  ): Promise<{
    difficultyScore: number
    preparationScore: number
    victoryProbability: number
    calculatedRank: string
    predictionReasoning: Array<{ isPositive: boolean; text: string }>
    systemRecommendation: string
  }> {
    // 1. Calculate Core Metrics
    const difficultyScore = Math.max(10, Math.round((estHours * 1.5) + (totalPhases * 10) + (dependencies * 15) - (historicalSuccessRate * 100)))
    
    const maxWeight = (0.5 * totalPhases) + 50
    const currentWeight = (0.5 * 0) + (0.3 * attributesReadiness) + (0.2 * currentEnergy) // 0 completed phases initially
    const preparationScore = Math.round((currentWeight / maxWeight) * 100)

    const victoryProbability = Math.min(99, Math.max(5, Math.round(50 + (preparationScore * 0.4) + (skillLevelDelta * 2) - (nemesisWeight * 5))))

    // 2. Determine calculatedRank based on difficultyScore
    let calculatedRank = 'D'
    if (difficultyScore >= 180) calculatedRank = 'SSS'
    else if (difficultyScore >= 150) calculatedRank = 'SS'
    else if (difficultyScore >= 120) calculatedRank = 'S'
    else if (difficultyScore >= 90) calculatedRank = 'A'
    else if (difficultyScore >= 60) calculatedRank = 'B'
    else if (difficultyScore >= 40) calculatedRank = 'C'

    const prompt = `You are THE SYSTEM. A candidate is planning to challenge a Boss Battle: "${title}".
We have calculated the baseline metrics for this encounter:
- Difficulty Score: ${difficultyScore}
- Preparation Score: ${preparationScore}%
- Victory Probability: ${victoryProbability}%
- Calculated Rank: ${calculatedRank}

Based on these parameters and the title, generate:
1. An array of tactical insights (pros/cons reasoning matrix) listing 3-4 entries. Each entry must have "isPositive" (boolean) and "text" (string description of the tactical vector).
2. A system recommendation narrative (1-2 sentences) advising the user on whether they should commit to this encounter now or build up attributes/energy first.

Respond in strict JSON format:
{
  "predictionReasoning": [
    { "isPositive": true, "text": "High motivation and energy baselines indicate strong capacity for immediate takeoff." },
    { "isPositive": false, "text": "Low attribute levels in Focus could introduce risk during later phases." }
  ],
  "systemRecommendation": "Direct entry is validated. However, reinforcing your Focus levels through daily sprints will mitigate late-stage degradation risks."
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        const parsed = JSON.parse(response.choices[0].message.content || '{}')
        return {
          difficultyScore,
          preparationScore,
          victoryProbability,
          calculatedRank,
          predictionReasoning: parsed.predictionReasoning || [],
          systemRecommendation: parsed.systemRecommendation || 'Direct entry is validated.'
        }
      } catch (e) {
        console.error('OpenAI analyzeBossBattle error, using fallback:', e)
      }
    }

    // Fallback generator
    const predictionReasoning = [
      { isPositive: true, text: `Current preparation status of ${preparationScore}% aligns with tactical expectations.` },
      { isPositive: currentEnergy >= 60, text: currentEnergy >= 60 ? "Current energy reserves are optimal for high-intensity phases." : "Exhaustion factors present; energy levels are below optimal threshold." },
      { isPositive: attributesReadiness >= 60, text: attributesReadiness >= 60 ? "Baseline attribute matrices show compatibility with rank challenge." : "Unrefined attributes may cause elevated friction in mid-tier stages." }
    ]
    const systemRecommendation = victoryProbability >= 70
      ? "Algorithmic indicators validate initiation. Proceed to accept the encounter."
      : "High friction danger detected. It is recommended to postpone and train core attributes first."

    return {
      difficultyScore,
      preparationScore,
      victoryProbability,
      calculatedRank,
      predictionReasoning,
      systemRecommendation
    }
  },

  async evaluateEmergentBoss(logs: string[]): Promise<{
    trigger_emergence: boolean
    title?: string
    archetype?: string
    discovery_manifesto?: string
    phases_injected?: Array<{ title: string }>
    difficultyScore?: number
    calculatedRank?: string
  }> {
    const prompt = `You are the semantic memory analysis engine of THE FORGE OS.
Review the past reflections and chronicled logs of the user:
${logs.map((l, i) => `- Log ${i + 1}: "${l}"`).join('\n')}

Identify any deeply recurring behavioral friction loops (e.g., repeating procrastination, nicotine/vape/substance consumption, skipped workouts) or implicit aspirations that the user frequently references but has not formulated into structured action chains.

If a loop is identified and is active, you must trigger an emergent boss battle.
If no active recurring loop is identified, return trigger_emergence = false.

Respond in strict JSON format:
{
  "trigger_emergence": true,
  "title": "Title of the Emergent Boss Battle (e.g., Break the Chain: Nicotine Severance)",
  "archetype": "IDENTITY_MUTATION | HEAVY_BLOCKER | COGNITIVE_RECONSTRUCTION",
  "discovery_manifesto": "An epic, high-contrast, Game-Master style paragraph explaining what the System has observed over the logs, outlining the pattern and inviting the user to confront this boss constructive loop directly.",
  "phases_injected": [
    { "title": "First phase title" },
    { "title": "Second phase title" },
    { "title": "Third phase title" }
  ],
  "difficultyScore": 85,
  "calculatedRank": "S"
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch (e) {
        console.error('OpenAI evaluateEmergentBoss error, using fallback:', e)
      }
    }

    // Fallback scanner logic
    const joined = logs.join(' ').toLowerCase()
    if (joined.includes('smoke') || joined.includes('nicotine') || joined.includes('vape') || joined.includes('tobacco') || joined.includes('cigarette')) {
      return {
        trigger_emergence: true,
        title: "Break the Chain: Nicotine Severance",
        archetype: "IDENTITY_MUTATION",
        discovery_manifesto: "The System has quietly observed your interaction threads. A persistent variable—the recurring pattern of nicotine consumption—continues to introduce noise into your Vitality and Resilience vectors. The engine evaluates that your current character attributes have achieved structural readiness to confront this pattern directly. This is not a task. This is an evolutionary turning point.",
        phases_injected: [
          { title: "Secure 7 consecutive days of absolute baseline chemical clearance" },
          { title: "Purge all immediate physical environmental triggers from your radius" },
          { title: "Log morning variance parameters through voice logs for evaluation" }
        ],
        difficultyScore: 88,
        calculatedRank: "S"
      }
    }

    return {
      trigger_emergence: false
    }
  },

  async extractCodexEntries(message: string): Promise<Array<{
    type: string
    importance: string
    narrativeState: string
    rawUserQuote: string
    linked_entities: any
  }>> {
    const prompt = `You are the Codex Extraction layer of THE FORGE OS.
The user sent this message: "${message}"

Your task is to identify if the user is expressing any:
1. BELIEF: A self-limiting or self-promoting internal narrative (e.g. "I'm terrible with deep logic").
2. DECLARATION: An explicit statement of intent or commitment (e.g. "I'm seving my dependency on nicotine today").
3. VALUE: A statement about what they prioritize or value (e.g. "Family is the most important thing to me").
4. RELATIONSHIP_AXIS: A statement about their relationship with someone else.

If you find any such statements, extract them. Treat them as fluctuating internal narratives, NOT objective fact.
Isolate the narrative state (summarized in the third-person, e.g. "The user operates under an internal narrative that they lack capacity for deep logical execution") and exact quote (protecting the historical quote).

Return a JSON array under the key "codex_entries". If none are identified, return an empty array.

Respond in strict JSON format:
{
  "codex_entries": [
    {
      "type": "BELIEF | DECLARATION | VALUE | RELATIONSHIP_AXIS",
      "importance": "COMMON | HIGH | EPIC | LEGENDARY",
      "narrativeState": "Third-person summary...",
      "rawUserQuote": "Exact quote...",
      "linked_entities": {
        "skills": [],
        "attributes": []
      }
    }
  ]
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        const parsed = JSON.parse(response.choices[0].message.content || '{}')
        return parsed.codex_entries || []
      } catch (e) {
        console.error('OpenAI extractCodexEntries error:', e)
      }
    }

    // Fallback parser: scan for self-limiting patterns
    const lower = message.toLowerCase()
    if (lower.includes('terrible') || lower.includes('never') || lower.includes('bad at') || lower.includes('fail') || lower.includes('im not')) {
      return [{
        type: 'BELIEF',
        importance: 'HIGH',
        narrativeState: `The user operates under a self-limiting narrative regarding their capabilities: "${message.substring(0, 60)}".`,
        rawUserQuote: message,
        linked_entities: { skills: [], attributes: ['Resilience'] }
      }]
    }
    if (lower.includes('want to') || lower.includes('will') || lower.includes('commit') || lower.includes('promise')) {
      return [{
        type: 'DECLARATION',
        importance: 'HIGH',
        narrativeState: `The user declares an intention or commitment: "${message.substring(0, 60)}".`,
        rawUserQuote: message,
        linked_entities: { skills: [], attributes: ['Execution'] }
      }]
    }

    return []
  },

  async generateAnnualReflectionAnalysis(pastBeliefQuote: string, turningPoints: string[]): Promise<string> {
    const prompt = `You are THE CHRONICLER of THE FORGE OS.
One year ago, the user recorded this self-limiting belief or reflection:
"${pastBeliefQuote}"

During this year, the user logged the following evidentiary Turning Points:
${turningPoints.map(tp => `- ${tp}`).join('\n')}

Your task is to write the Annual Reflection Mirror analysis.
Tone: Solemn, literary, highly premium, unyielding ally, objective observer of growth. Avoid gamey terms or simple congratulations.
Write a narrative (100-150 words) outlining how history has directly challenged their original belief. Highlight that the limitations they once assumed to be core traits were merely temporary states. Describe their persistence as proof of an evolving identity.`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }]
        })
        return response.choices[0].message.content || 'The chronicled logs demonstrate that your past limitations were merely temporary states.'
      } catch (e) {
        console.error('OpenAI generateAnnualReflectionAnalysis error:', e)
      }
    }

    return `One year ago, you entered this system operating under an internal narrative of structural limitation, explicitly categorizing yourself as someone incapable of deep logic or follow-through. History has directly challenged that belief. The chronological logs demonstrate that the limitations once assumed to be core traits were merely temporary obstacles created by a lack of an organized build environment. Over the past 365 cycles, your execution has rendered those original assumptions inaccurate. The system highlights your persistence through multiple complex tasks as proof of an evolving identity.`
  },

  async runAnalyst(reflection: string, activeQuestsAndPhases: string[]): Promise<{
    quest_and_phase_resolutions: Array<{
      detected_action: string
      target_skill: string
      skill_xp_allocated: number
      attribute_allocations: Array<{ name: string, xp: number }>
      matched_active_entity: string
      resolution_status: 'COMPLETED' | 'PROGRESS' | 'NONE'
    }>
    environmental_context_extractions: Array<{
      category: string
      description: string
      emotional_valence: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
    }>
    character_state_modifiers: {
      energy_delta: number
      stress_delta: number
      fulfillment_delta: number
      mood: string
      estimated_energy_level: number
    }
    proposed_memory_candidates: Array<{
      type: string
      summary: string
      raw_quote: string
    }>
    confidence_score: number
    ambiguity_reason: string
    user_calibration_prompt: string
  }> {
    const prompt = `You are THE ANALYST, the first stage of the dual-AI reflection engine of THE FORGE.
The user submitted this evening reflection: "${reflection}"

Currently active quests and boss battle phases in their active list:
${activeQuestsAndPhases.map((q, i) => `- [${i}]: ${q}`).join('\n')}

Analyze the reflection text and extract:
1. "quest_and_phase_resolutions": Check if they explicitly performed actions completing or making progress on any of these active quests or boss phases. Map the detected action, target skill, skill XP, specific attribute allocations (Focus, Knowledge, Strength, Resilience, Charisma, etc.), the matched active entity (e.g. "QUEST: Deploy MVP" or "PHASE: Set up auth"), and whether the resolution status is "COMPLETED" or "PROGRESS".
2. "environmental_context_extractions": Extract social, family, work, recreational context categories, description, and emotional valence (POSITIVE | NEUTRAL | NEGATIVE).
3. "character_state_modifiers": Numeric modifiers (between -40 and +40) representing the impact of today on energy, stress, and fulfillment. Also estimate a simple text mood (e.g. "Accomplished", "Exhausted but happy", "Restless") and a 1-10 energy level.
4. "proposed_memory_candidates": Candidate records for the Codex. Categories: BELIEF, DECLARATION, VALUE, RELATIONSHIP_AXIS, TURNING_POINT.
5. "confidence_score": Evaluate your own extraction confidence. Output a decimal between 0.00 and 1.00. If the user statement is ambiguous, vague, or mentions variable durations (e.g. "worked around 4 hours"), drop confidence below 0.80.
6. "ambiguity_reason": A short sentence explaining why confidence is lower than 1.00.
7. "user_calibration_prompt": If confidence_score < 0.80, write a short, friendly clarifying prompt (in first-person voice of the system) asking the user to confirm/adjust details (e.g. "I noticed you coded, but was it unbroken focus?").

Respond in strict JSON format matching:
{
  "quest_and_phase_resolutions": [
    {
      "detected_action": "Fixed the Prisma migration script",
      "target_skill": "Programming",
      "skill_xp_allocated": 25,
      "attribute_allocations": [
        { "name": "Focus", "xp": 5 },
        { "name": "Knowledge", "xp": 5 }
      ],
      "matched_active_entity": "PHASE: Deploy Production Database",
      "resolution_status": "COMPLETED"
    }
  ],
  "environmental_context_extractions": [
    {
      "category": "FAMILY_INTERACTION",
      "description": "Extended communication with mother.",
      "emotional_valence": "POSITIVE"
    }
  ],
  "character_state_modifiers": {
    "energy_delta": -15,
    "stress_delta": -20,
    "fulfillment_delta": 25,
    "mood": "Fulfilling connection",
    "estimated_energy_level": 7
  },
  "proposed_memory_candidates": [
    {
      "type": "RELATIONSHIP_AXIS",
      "summary": "Deepened emotional alignment with mother via extended contextual dialogue.",
      "raw_quote": "my mum called me and we spoke for two hours. It felt really good to connect though."
    }
  ],
  "confidence_score": 0.95,
  "ambiguity_reason": "",
  "user_calibration_prompt": ""
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch (e) {
        console.error('OpenAI runAnalyst error, triggering fallback:', e)
      }
    }

    // Fallback scanner logic
    const lower = reflection.toLowerCase()
    const resolutions = []
    const context = []
    const proposed = []

    let energyDelta = -10
    let stressDelta = 0
    let fulfillmentDelta = 10
    let mood = 'Routine cycle'
    let energyLevel = 6

    if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleepy')) {
      energyDelta = -25
      stressDelta = 10
      energyLevel = 3
      mood = 'Exhausted state'
    }

    if (lower.includes('mom') || lower.includes('mother') || lower.includes('parent') || lower.includes('family') || lower.includes('speak') || lower.includes('spoke')) {
      fulfillmentDelta = 20
      stressDelta = -15
      context.push({
        category: 'FAMILY_INTERACTION',
        description: 'Communicated with family members.',
        emotional_valence: 'POSITIVE' as const
      })
      proposed.push({
        type: 'RELATIONSHIP_AXIS',
        summary: 'Connected with family and prioritised communication baseline.',
        raw_quote: reflection.substring(0, 100)
      })
    }

    // Try to match any active entities
    for (const entity of activeQuestsAndPhases) {
      const entityClean = entity.replace(/^(QUEST:|PHASE:)\s*/, '').toLowerCase()
      if (lower.split(' ').some(w => w.length > 3 && entityClean.includes(w))) {
        resolutions.push({
          detected_action: `Executed action related to ${entity}`,
          target_skill: 'General',
          skill_xp_allocated: 30,
          attribute_allocations: [{ name: 'Focus', xp: 10 }, { name: 'Knowledge', xp: 5 }],
          matched_active_entity: entity,
          resolution_status: 'COMPLETED' as const
        })
        proposed.push({
          type: 'TURNING_POINT',
          summary: `Made definitive progress resolving active protocol: ${entity}`,
          raw_quote: reflection.substring(0, 150)
        })
      }
    }

    const hasAmbiguity = lower.includes('about') || lower.includes('around') || lower.includes('maybe') || lower.includes('probably')

    return {
      quest_and_phase_resolutions: resolutions,
      environmental_context_extractions: context,
      character_state_modifiers: {
        energy_delta: energyDelta,
        stress_delta: stressDelta,
        fulfillment_delta: fulfillmentDelta,
        mood,
        estimated_energy_level: energyLevel
      },
      proposed_memory_candidates: proposed,
      confidence_score: hasAmbiguity ? 0.65 : 1.0,
      ambiguity_reason: hasAmbiguity ? "Ambiguity indicator keywords detected (about, around, maybe)." : "",
      user_calibration_prompt: hasAmbiguity ? "I detected progress details, but the values seem variable. Did you manage to complete the unbroken focus parameters?" : ""
    }
  },

  async evaluateLongTermSignificance(candidate: any, codexHistory: string[]): Promise<{
    isSignificant: boolean
    rank: 'COMMON' | 'HIGH' | 'EPIC' | 'LEGENDARY'
    contextualReframing: string
  }> {
    const prompt = `You are THE CHRONICLER, the high-reasoning sifter of the dual-AI memory engine of THE FORGE.
Evaluate if this proposed candidate memory will matter to the user's life narrative 5 years from now.
Discard mundane daily actions. Lock only critical relationships, turning points, structural shift in beliefs, or key value commitments.

Proposed Candidate:
Type: ${candidate.type}
Summary: ${candidate.summary}
Raw Quote: ${candidate.raw_quote}

User's Existing Codex History:
${codexHistory.join('\n')}

Respond in strict JSON format:
{
  "isSignificant": true,
  "rank": "COMMON | HIGH | EPIC | LEGENDARY",
  "contextualReframing": "A highly literary third-person framing context of the event (e.g. 'The user broke past isolation barriers, securing key communication nodes with family.')"
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch (e) {
        console.error('OpenAI evaluateLongTermSignificance error, using fallback:', e)
      }
    }

    const lower = (candidate.raw_quote || '').toLowerCase()
    const isSignificant = candidate.type === 'RELATIONSHIP_AXIS' || lower.includes('quit') || lower.includes('conquer') || lower.includes('deploy') || lower.includes('mother') || lower.includes('family')
    return {
      isSignificant,
      rank: lower.includes('conquer') || lower.includes('quit') ? 'LEGENDARY' : 'HIGH',
      contextualReframing: candidate.summary
    }
  },

  async generateDynamicQuest(reflection: string, energy: number, stress: number): Promise<{
    title: string
    description: string
    quest_type: 'MAIN' | 'PRIORITY' | 'SIDE' | 'OPPORTUNITY'
    difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
    xp_reward: number
    reason: string
  }> {
    const prompt = `You are THE SYSTEM. The user has logged a day with high stress (${stress}/100) or low energy (${energy}/100).
Reflection: "${reflection}"

Generate a restorative, low-friction dynamic quest for tomorrow to protect them from burnout and maintain momentum.
Do not assign intensive work. Focus on light cleanup, short review, or walking baseline steps.

Respond in strict JSON format:
{
  "title": "Short title",
  "description": "Short description of what to do",
  "quest_type": "OPPORTUNITY",
  "difficulty": "E",
  "xp_reward": 25,
  "reason": "Explain to the user why the system has injected this adaptive quest"
}`

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
      } catch (e) {
        console.error('OpenAI generateDynamicQuest error, using fallback:', e)
      }
    }

    return {
      title: "Tactical Fluidity",
      description: "Execute a focused, 45-minute code cleanup or light maintenance block to maintain momentum without cognitive burnout.",
      quest_type: "OPPORTUNITY",
      difficulty: "E",
      xp_reward: 25,
      reason: "Your capacity for deep focus is restricted today. Protect the build baseline with a lower-friction execution track."
    }
  }
}

