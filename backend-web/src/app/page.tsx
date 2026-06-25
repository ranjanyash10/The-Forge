'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Navbar } from '@/components/Navbar'
import { RewardModal } from '@/components/RewardModal'
import { Sword, Zap, Shield, Sparkles, PlusCircle, CheckCircle2, Award, Calendar, ChevronRight, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'

interface UserStatus {
  id: string
  email: string
  username: string
  global_xp: number
  global_level: number
  current_title: string | null
  character?: {
    id: string
    name: string
    class: string
    origin_story: string
    avatar_url: string
    current_rank: string
    momentum: number
    weight?: string
    height?: string
    fitness_goals?: string
    execution_lvl: number
    execution_base: number
    adaptability_lvl: number
    adaptability_base: number
    resilience_lvl: number
    resilience_base: number
    self_awareness_lvl: number
    self_awareness_base: number
    ego_resistance_lvl: number
    ego_resistance_base: number
    wisdom_xp: number
    wisdom_lvl: number
    mobility_xp: number
    mobility_lvl: number
    strength_xp: number
    strength_lvl: number
    willpower_xp: number
    willpower_lvl: number
  }
  skills: Array<{
    id: string
    name: string
    description: string
    category: string
    rank: string
    xp: number
    level: number
  }>
  quests: Array<{
    id: string
    title: string
    description: string
    difficulty: string
    xp_reward: number
    status: string
    quest_type: string
  }>
}

export default function ForgeHub() {
  const { userId, isReady, logout } = useAuth()
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Custom Quest Modal state
  const [showAddQuest, setShowAddQuest] = useState(false)
  const [newQuestTitle, setNewQuestTitle] = useState('')
  const [newQuestDesc, setNewQuestDesc] = useState('')
  const [newQuestType, setNewQuestType] = useState<'SIDE' | 'MAIN' | 'ELITE' | 'BOSS'>('SIDE')
  const [newQuestDifficulty, setNewQuestDifficulty] = useState('E')
  
  // Alter Ego creation form state
  const [charName, setCharName] = useState('')
  const [charAspirations, setCharAspirations] = useState('')
  const [charStrengths, setCharStrengths] = useState('')
  const [charWeaknesses, setCharWeaknesses] = useState('')
  const [charWeight, setCharWeight] = useState('')
  const [charHeight, setCharHeight] = useState('')
  const [charFitnessGoals, setCharFitnessGoals] = useState('')
  const [execBase, setExecBase] = useState(5)
  const [adapBase, setAdapBase] = useState(5)
  const [resiBase, setResiBase] = useState(5)
  const [selfBase, setSelfBase] = useState(5)
  const [egoBase, setEgoBase] = useState(5)
  const [creatingCharacter, setCreatingCharacter] = useState(false)
  const [charGeneratedResult, setCharGeneratedResult] = useState<any | null>(null)

  // Reward Modal state
  const [rewardOpen, setRewardOpen] = useState(false)
  const [rewardData, setRewardData] = useState({
    questTitle: '',
    xpGained: 0,
    skillName: '',
    globalLevelUp: false,
    newGlobalLevel: 1,
    unlockedAchievements: [] as string[],
    unlockedTitles: [] as string[]
  })

  // Quest Category Filter
  const [questTab, setQuestTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE')

  const fetchStatus = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/character/status?userId=${userId}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setStatus(data.user)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isReady && userId) {
      fetchStatus()
    }
  }, [isReady, userId])

  // Create Custom Character Alter Ego
  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!charName.trim() || !userId) return
    
    try {
      setCreatingCharacter(true)
      const res = await fetch('/api/character/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          name: charName,
          aspirations: charAspirations,
          strengths: charStrengths,
          weaknesses: charWeaknesses,
          weight: charWeight,
          height: charHeight,
          fitnessGoals: charFitnessGoals,
          executionBase: execBase,
          adaptabilityBase: adapBase,
          resilienceBase: resiBase,
          selfAwarenessBase: selfBase,
          egoResistanceBase: egoBase
        })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        setCharGeneratedResult(data.aiGeneration)
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setCreatingCharacter(false)
    }
  }

  // Create Quest manually
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestTitle.trim()) return

    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: status?.id,
          title: newQuestTitle,
          description: newQuestDesc,
          quest_type: newQuestType,
          difficulty: newQuestDifficulty
        })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        // Refresh status
        fetchStatus()
        // Reset form
        setNewQuestTitle('')
        setNewQuestDesc('')
        setNewQuestType('SIDE')
        setNewQuestDifficulty('E')
        setShowAddQuest(false)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Delete Quest
  const handleDeleteQuest = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return
    try {
      const res = await fetch(`/api/quests?questId=${questId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        fetchStatus()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Complete Quest
  const handleCompleteQuest = async (questId: string, associatedSkillName: string) => {
    try {
      // Find matching skill ID in status if available
      const matchingSkill = status?.skills.find(s => s.name.toLowerCase() === associatedSkillName.toLowerCase())
      
      const res = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: status?.id,
          questId,
          skillId: matchingSkill?.id || null
        })
      })
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
      } else {
        // Set reward data and show modal
        setRewardData({
          questTitle: data.quest.title,
          xpGained: data.xpGained,
          skillName: data.updatedSkill ? data.updatedSkill.name : undefined,
          globalLevelUp: data.globalLevelUp,
          newGlobalLevel: data.newGlobalLevel,
          unlockedAchievements: data.unlockedAchievements,
          unlockedTitles: data.unlockedTitles
        })
        setRewardOpen(true)
        
        // Refresh local status
        fetchStatus()
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (!isReady || !userId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4" />
        <span className="mono-font text-xs uppercase tracking-widest text-slate-400 animate-pulse">
          Securing Nexus Connection...
        </span>
      </div>
    )
  }

  if (loading && !status) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4" />
        <span className="mono-font text-xs uppercase tracking-widest text-slate-400 animate-pulse">
          ACCESSING THE SYSTEM DATACORE...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-red-400 p-4">
        <h2 className="text-lg font-bold mb-2">System Error</h2>
        <p className="text-sm mb-4 text-slate-400">{error}</p>
        <button onClick={fetchStatus} className="px-4 py-2 bg-purple-700 rounded text-slate-50 text-xs uppercase tracking-widest">
          Reinitialize Connection
        </button>
      </div>
    )
  }

  // If no Character has been compiled, show Alter Ego initialization screen
  if (!status?.character) {
    return (
      <div className="flex-1 flex flex-col p-6 text-slate-100 min-h-screen justify-center">
        {charGeneratedResult ? (
          /* Character Compilation complete screen */
          <div className="glass-panel border-cyan-500/20 p-6 rounded-xl flex flex-col items-center text-center gap-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-500">
            <div className="bg-cyan-500/10 p-4 rounded-full border border-cyan-500/30 animate-pulse">
              <Sparkles className="text-cyan-400 h-10 w-10" />
            </div>
            
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 rpg-font">
                Alter Ego Successfully Forged
              </span>
              <h2 className="text-2xl font-black text-slate-50 mt-1">{charGeneratedResult.class}</h2>
              <p className="text-[11px] uppercase tracking-wider text-purple-400 rpg-font mt-0.5">
                Archetype: {charGeneratedResult.archetype}
              </p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed border-y border-purple-950/40 py-4 max-w-sm">
              "{charGeneratedResult.biography}"
            </div>

            <button
              onClick={() => {
                setCharGeneratedResult(null)
                fetchStatus()
              }}
              className="w-full bg-gradient-to-r from-purple-700 to-cyan-600 border border-purple-500/30 text-xs uppercase font-extrabold tracking-widest py-3 rounded-lg hover:from-purple-600 hover:to-cyan-500 transition shadow-lg"
            >
              Enter The Forge
            </button>
          </div>
        ) : (
          /* Input Wizard */
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-widest text-purple-400">THE SYSTEM REQUIRES IDENTITY</h2>
              <p className="text-xs text-slate-400 mt-1">
                You are entering a realm of progression. Compile your alter ego character sheet.
              </p>
            </div>

            <form onSubmit={handleCreateCharacter} className="flex flex-col gap-4 bg-slate-950/50 p-5 rounded-lg border border-purple-950/60 glass-panel">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Character Name</label>
                <input 
                  type="text" 
                  value={charName} 
                  onChange={e => setCharName(e.target.value)}
                  placeholder="e.g. Elysian Monarch"
                  required
                  className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aspirations</label>
                <input 
                  type="text" 
                  value={charAspirations} 
                  onChange={e => setCharAspirations(e.target.value)}
                  placeholder="e.g. Mastery in Software assets, athletic conditioning"
                  className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strengths</label>
                <input 
                  type="text" 
                  value={charStrengths} 
                  onChange={e => setCharStrengths(e.target.value)}
                  placeholder="e.g. Focused logic, coding skills, boxing"
                  className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weaknesses</label>
                <input 
                  type="text" 
                  value={charWeaknesses} 
                  onChange={e => setCharWeaknesses(e.target.value)}
                  placeholder="e.g. Public speaking, inconsistent sleeping hours"
                  className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none"
                />
              </div>

              {/* Physical Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weight</label>
                  <input 
                    type="text" 
                    value={charWeight} 
                    onChange={e => setCharWeight(e.target.value)}
                    placeholder="e.g. 78 kg"
                    className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Height</label>
                  <input 
                    type="text" 
                    value={charHeight} 
                    onChange={e => setCharHeight(e.target.value)}
                    placeholder="e.g. 180 cm"
                    className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fitness Goals</label>
                <input 
                  type="text" 
                  value={charFitnessGoals} 
                  onChange={e => setCharFitnessGoals(e.target.value)}
                  placeholder="e.g. Fat loss, stamina improvement"
                  className="bg-slate-900 border border-purple-950 p-2.5 rounded text-sm text-slate-100 focus:outline-none"
                />
              </div>

              {/* Mindset Baseline Stats */}
              <div className="border-t border-purple-950/60 my-2 pt-4">
                <h3 className="text-xs uppercase font-bold text-purple-400 tracking-widest mb-3">Initialize Mindset Baselines (1-10)</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <span>Execution</span>
                      <span className="text-purple-400">{execBase}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={execBase} 
                      onChange={e => setExecBase(parseInt(e.target.value))}
                      className="accent-purple-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <span>Adaptability</span>
                      <span className="text-purple-400">{adapBase}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={adapBase} 
                      onChange={e => setAdapBase(parseInt(e.target.value))}
                      className="accent-purple-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <span>Resilience</span>
                      <span className="text-purple-400">{resiBase}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={resiBase} 
                      onChange={e => setResiBase(parseInt(e.target.value))}
                      className="accent-purple-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <span>Self-Awareness</span>
                      <span className="text-purple-400">{selfBase}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={selfBase} 
                      onChange={e => setSelfBase(parseInt(e.target.value))}
                      className="accent-purple-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <span>Ego Resistance</span>
                      <span className="text-purple-400">{egoBase}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" 
                      value={egoBase} 
                      onChange={e => setEgoBase(parseInt(e.target.value))}
                      className="accent-purple-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingCharacter}
                className="bg-gradient-to-r from-purple-700 to-purple-900 border border-purple-500/30 text-xs font-black uppercase tracking-widest py-3 rounded text-slate-50 hover:from-purple-600 hover:to-purple-800 transition disabled:opacity-50 mt-2"
              >
                {creatingCharacter ? 'FORGING SHEETS...' : 'INITIATE SYNCHRONIZATION'}
              </button>
            </form>
            <div className="text-center mt-4">
              <button
                onClick={logout}
                className="text-[10px] text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors font-semibold"
              >
                ▸ Logout / Switch Account
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Filter Quests
  const activeQuests = status.quests.filter(q => q.status === 'ACTIVE')
  const completedQuests = status.quests.filter(q => q.status === 'COMPLETED')
  const shownQuests = questTab === 'ACTIVE' ? activeQuests : completedQuests

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-6 relative min-h-screen">
      
      {/* 1. Header Profile Hud */}
      <Header 
        username={status.username}
        title={status.current_title || 'Wanderer'}
        globalLevel={status.global_level}
        globalXp={status.global_xp}
        rank={status.character.current_rank}
        onLogout={logout}
      />

      <div className="p-4 flex flex-col gap-6">
        
        {/* 2. Character Portrait Section */}
        <div className="glass-panel border-purple-900/10 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden bg-[#0a0d1d]/40">
          <div className="relative w-16 h-16 rounded border-2 border-purple-500/40 glow-purple flex-shrink-0 overflow-hidden bg-slate-950">
            <img 
              src={status.character.avatar_url} 
              alt={status.character.name}
              className="w-full h-full object-cover"
            />
            {/* Rank corner flag */}
            <div className="absolute bottom-0 right-0 bg-purple-600 px-1 py-0.5 rounded-tl text-[8px] font-bold text-slate-50">
              {status.character.current_rank}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-md font-bold text-slate-100 leading-tight">
              {status.character.name}
            </h3>
            <p className="text-xs text-purple-400 font-semibold rpg-font mt-0.5">
              Class: {status.character.class}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1 italic line-clamp-2">
              "{status.character.origin_story}"
            </p>
          </div>
        </div>

        {/* Momentum & Physical Parameters Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Momentum Panel */}
          <div className="glass-panel border-purple-950 p-4 rounded-xl flex items-center justify-between gap-4 bg-[#0a0d1d]/40">
            <div className="flex-1">
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Momentum
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {status.character.momentum >= 80 ? (
                  <span className="text-cyan-400 font-extrabold animate-pulse">FLOW STATE ACTIVE (+15% XP)</span>
                ) : status.character.momentum < 20 ? (
                  <span className="text-red-400 font-bold">SLUGGISH (INSCRIBE CHRONICLES TO REBUILD)</span>
                ) : (
                  <span>ACTIVE VELOCITY</span>
                )}
              </p>
            </div>
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border border-purple-950 bg-slate-950 flex-shrink-0">
              <span className="text-xs font-black mono-font text-purple-400">{status.character.momentum}/100</span>
              {status.character.momentum >= 80 && (
                <div className="absolute inset-0 rounded-full border border-cyan-400/80 animate-ping" />
              )}
            </div>
          </div>

          {/* Physical Parameters Panel */}
          <div className="glass-panel border-purple-950 p-4 rounded-xl flex flex-col gap-2 bg-[#0a0d1d]/40 text-xs">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Physical Outlook</h4>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-slate-950/50 p-2 rounded border border-purple-950/40">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">Weight</span>
                <span className="text-slate-200 font-black">{status.character.weight || 'Not logged'}</span>
              </div>
              <div className="bg-slate-950/50 p-2 rounded border border-purple-950/40">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">Height</span>
                <span className="text-slate-200 font-black">{status.character.height || 'Not set'}</span>
              </div>
            </div>
            {status.character.fitness_goals && (
              <p className="text-[9px] text-slate-400 mt-1 truncate">
                <span className="font-bold text-slate-500">Goals: </span>{status.character.fitness_goals}
              </p>
            )}
          </div>
        </div>

        {/* Core Attributes Panel */}
        <section className="flex flex-col gap-2.5">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-cyan-400 animate-pulse" />
            Core RPG Attributes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Strength', lvl: status.character.strength_lvl, xp: status.character.strength_xp, icon: <Shield size={12} className="text-red-400 animate-pulse" /> },
              { name: 'Willpower', lvl: status.character.willpower_lvl, xp: status.character.willpower_xp, icon: <Sparkles size={12} className="text-amber-400 animate-pulse" /> },
              { name: 'Mobility', lvl: status.character.mobility_lvl, xp: status.character.mobility_xp, icon: <Zap size={12} className="text-green-400 animate-pulse" /> },
              { name: 'Wisdom', lvl: status.character.wisdom_lvl, xp: status.character.wisdom_xp, icon: <Sword size={12} className="text-blue-400 animate-pulse" /> }
            ].map(stat => {
              const reqXp = stat.lvl * 100
              const pct = Math.min(100, (stat.xp / reqXp) * 100)
              return (
                <div key={stat.name} className="bg-[#090b16]/60 border border-purple-950/40 p-3 rounded shadow flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5">
                      {stat.icon}
                      {stat.name}
                    </span>
                    <span className="bg-slate-900 border border-slate-800 text-[8px] font-black text-cyan-400 px-1.5 py-0.5 rounded tracking-wide">
                      LVL {stat.lvl}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[8px] text-slate-500 font-semibold mb-1">
                      <span>XP PROGRESS</span>
                      <span>{stat.xp} / {reqXp}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden relative border border-slate-900/60">
                      <div 
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Mindset Attributes Panel */}
        <section className="flex flex-col gap-2.5">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sword size={14} className="text-purple-400" />
            Mindset & Discipline Attributes
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {[
              { name: 'Execution', val: status.character.execution_lvl, base: status.character.execution_base },
              { name: 'Adaptability', val: status.character.adaptability_lvl, base: status.character.adaptability_base },
              { name: 'Resilience', val: status.character.resilience_lvl, base: status.character.resilience_base },
              { name: 'Self-Awareness', val: status.character.self_awareness_lvl, base: status.character.self_awareness_base },
              { name: 'Ego Resistance', val: status.character.ego_resistance_lvl, base: status.character.ego_resistance_base }
            ].map(stat => (
              <div key={stat.name} className="bg-[#090b16]/60 border border-purple-950/40 p-2 rounded text-center shadow">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block font-bold truncate" title={stat.name}>{stat.name}</span>
                <span className="text-xs font-black text-purple-400 block mt-1">{stat.val}</span>
                <span className="text-[7px] text-slate-600 block">Base: {stat.base}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ACTIVE SKILLS PANEL */}
        <section className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              Active Skill Nodes
            </h3>
          </div>
          
          {status.skills.length === 0 ? (
            <div className="text-center p-6 bg-slate-950/30 rounded border border-purple-950/20 text-xs text-slate-500">
              No active skills discovered. Initialize paths in the Skills tab.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {status.skills.map((skill) => {
                const xpNeeded = skill.level * 100
                const xpPct = Math.min(100, (skill.xp / xpNeeded) * 100)
                
                return (
                  <div key={skill.id} className="bg-[#090b16]/60 border border-purple-950/40 p-3 rounded flex items-center justify-between relative overflow-hidden shadow">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{skill.name}</h4>
                        <span className="bg-slate-900 border border-slate-800 text-purple-300 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                          LVL {skill.level}
                        </span>
                      </div>
                      
                      {/* Mini XP meter */}
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2 relative border border-slate-900">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${xpPct}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Rank</span>
                      <span className="text-lg font-black text-cyan-400 rpg-font leading-none">{skill.rank}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 4. QUEST LOGS SECTION */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sword size={14} className="text-purple-400" />
              Active Quest Logs
            </h3>
            
            <button 
              onClick={() => setShowAddQuest(true)}
              className="text-[10px] uppercase font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <PlusCircle size={12} />
              Forge Quest
            </button>
          </div>

          {/* Add custom quest form inline overlay */}
          {showAddQuest && (
            <form onSubmit={handleCreateQuest} className="bg-slate-950 border border-cyan-500/20 p-4 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center pb-1 border-b border-purple-950/40">
                <span className="text-[10px] uppercase font-extrabold text-cyan-400 tracking-widest rpg-font">Create New Quest</span>
                <button type="button" onClick={() => setShowAddQuest(false)} className="text-slate-400 text-xs hover:text-slate-200">Cancel</button>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase font-bold text-slate-500">Quest Title</label>
                <input 
                  type="text" 
                  value={newQuestTitle}
                  onChange={e => setNewQuestTitle(e.target.value)}
                  placeholder="e.g. HIIT Training session"
                  required
                  className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase font-bold text-slate-500">Description</label>
                <input 
                  type="text" 
                  value={newQuestDesc}
                  onChange={e => setNewQuestDesc(e.target.value)}
                  placeholder="e.g. 4 rounds of interval sprints"
                  className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] uppercase font-bold text-slate-500">Quest Type</label>
                  <select 
                    value={newQuestType}
                    onChange={e => setNewQuestType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="SIDE">Side Quest (20 XP)</option>
                    <option value="MAIN">Main Quest (50 XP)</option>
                    <option value="ELITE">Elite Quest (100 XP)</option>
                    <option value="BOSS">Boss Battle (300 XP)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8px] uppercase font-bold text-slate-500">Suggested Difficulty</label>
                  <select 
                    value={newQuestDifficulty}
                    onChange={e => setNewQuestDifficulty(e.target.value)}
                    className="bg-slate-900 border border-slate-800 p-2 rounded text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="E">Rank E</option>
                    <option value="D">Rank D</option>
                    <option value="C">Rank C</option>
                    <option value="B">Rank B</option>
                    <option value="A">Rank A</option>
                    <option value="S">Rank S</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-50 text-[10px] font-black uppercase tracking-wider py-2.5 rounded shadow mt-1"
              >
                Inscribe Quest
              </button>
            </form>
          )}

          {/* Quest Filters Tabs */}
          <div className="flex border-b border-purple-950/40 text-xs">
            <button 
              onClick={() => setQuestTab('ACTIVE')}
              className={`flex-1 text-center py-2 font-bold uppercase tracking-wider border-b-2 transition ${
                questTab === 'ACTIVE' 
                  ? 'border-purple-500 text-purple-300' 
                  : 'border-transparent text-slate-500'
              }`}
            >
              Active ({activeQuests.length})
            </button>
            <button 
              onClick={() => setQuestTab('COMPLETED')}
              className={`flex-1 text-center py-2 font-bold uppercase tracking-wider border-b-2 transition ${
                questTab === 'COMPLETED' 
                  ? 'border-purple-500 text-purple-300' 
                  : 'border-transparent text-slate-500'
              }`}
            >
              Completed ({completedQuests.length})
            </button>
          </div>

          {shownQuests.length === 0 ? (
            <div className="text-center p-8 bg-slate-950/20 rounded border border-purple-950/20 text-xs text-slate-500">
              No quests in this catalog.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {shownQuests.map((quest) => {
                
                // Categorize reward styling based on type
                let colorClass = 'border-purple-950/40 bg-slate-950/50'
                let badgeColor = 'bg-slate-900 text-slate-400'
                
                if (quest.quest_type === 'BOSS') {
                  colorClass = 'border-amber-500/25 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                  badgeColor = 'bg-amber-950/40 text-amber-300 border border-amber-500/25'
                } else if (quest.quest_type === 'ELITE') {
                  colorClass = 'border-cyan-500/25 bg-cyan-500/5'
                  badgeColor = 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/25'
                } else if (quest.quest_type === 'MAIN') {
                  colorClass = 'border-purple-500/25 bg-purple-500/5'
                  badgeColor = 'bg-purple-950/40 text-purple-300 border border-purple-500/25'
                }

                // Determine skill mapping (e.g. Physique for Body, Programming for Mind, SaaS/Sales for Wealth)
                let skillMapping = 'General'
                if (quest.title.toLowerCase().includes('run') || quest.title.toLowerCase().includes('workout') || quest.title.toLowerCase().includes('lift') || quest.title.toLowerCase().includes('physique')) {
                  skillMapping = 'Physique'
                } else if (quest.title.toLowerCase().includes('code') || quest.title.toLowerCase().includes('program') || quest.title.toLowerCase().includes('schema') || quest.title.toLowerCase().includes('api')) {
                  skillMapping = 'Programming'
                } else if (quest.title.toLowerCase().includes('client') || quest.title.toLowerCase().includes('saas') || quest.title.toLowerCase().includes('sale')) {
                  skillMapping = 'SaaS'
                }

                return (
                  <div 
                    key={quest.id} 
                    className={`border p-4 rounded-xl flex items-center justify-between gap-3 transition-all relative overflow-hidden ${colorClass}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase ${badgeColor}`}>
                          {quest.quest_type === 'SIDE' ? 'Side Quest' : quest.quest_type === 'MAIN' ? 'Main Quest' : quest.quest_type === 'ELITE' ? 'Elite Quest' : 'Boss Battle'}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Difficulty {quest.difficulty}</span>
                      </div>
                      
                      <h4 className="text-md font-bold text-slate-100 tracking-wide mt-1.5 truncate">
                        {quest.title}
                      </h4>
                      {quest.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {quest.description}
                        </p>
                      )}
                      
                      <div className="text-[10px] text-purple-400 font-extrabold mt-1.5 uppercase flex items-center gap-1">
                        <Sparkles size={10} />
                        +{quest.xp_reward} XP to {skillMapping}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      {quest.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCompleteQuest(quest.id, skillMapping)}
                          className="bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-400 p-2.5 rounded-lg flex items-center justify-center transition active:scale-95 flex-shrink-0"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteQuest(quest.id)}
                        className="bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 p-2.5 rounded-lg flex items-center justify-center transition active:scale-95 flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Navbar */}
      <Navbar />

      {/* Reward Overlay Modal */}
      <RewardModal 
        isOpen={rewardOpen}
        onClose={() => setRewardOpen(false)}
        questTitle={rewardData.questTitle}
        xpGained={rewardData.xpGained}
        skillName={rewardData.skillName}
        globalLevelUp={rewardData.globalLevelUp}
        newGlobalLevel={rewardData.newGlobalLevel}
        unlockedAchievements={rewardData.unlockedAchievements}
        unlockedTitles={rewardData.unlockedTitles}
      />
    </div>
  )
}
