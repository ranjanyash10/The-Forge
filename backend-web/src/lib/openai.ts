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
  quest_type: 'MAIN' | 'SIDE' | 'ELITE' | 'BOSS'
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  xp_reward: number
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
  quest_type: 'MAIN' | 'SIDE' | 'ELITE' | 'BOSS'
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
  "biography": "A short, epic 3-4 sentence narrative biography outlining their potential. Do not simply restate their inputs; write high-quality, tasteful, progress-fantasy prose describing their transition.",
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
3. A brief, epic description of the skill in RPG terms.

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
  }
}
