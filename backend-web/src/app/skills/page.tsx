'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/lib/useAuth'
import { GitBranch, Shield, Zap, Sparkles, Terminal, Check, X, BookOpen, DollarSign, Brain, MessageSquare, Heart } from 'lucide-react'

interface UserStatus {
  id: string
  email: string
  username: string
  global_xp: number
  global_level: number
  current_title: string | null
  character: {
    id: string
    name: string
    class: string
    avatar_url: string
    current_rank: string
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
}

interface DiscoveredSkill {
  name: string
  category: 'BODY' | 'WEALTH' | 'MIND' | 'INFLUENCE'
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  description: string
}

export default function SkillsCodex() {
  const { userId, isReady, logout } = useAuth()
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Skill Discovery state
  const [proposal, setProposal] = useState('')
  const [discovering, setDiscovering] = useState(false)
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveredSkill | null>(null)
  const [accepting, setAccepting] = useState(false)

  const fetchStatus = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/character/status?userId=${userId}`)
      const data = await res.json()
      if (!data.error) {
        setStatus(data.user)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isReady && userId) {
      fetchStatus()
    }
  }, [isReady, userId])

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposal.trim() || !userId) return

    try {
      setDiscovering(true)
      setDiscoveryResult(null)
      const res = await fetch('/api/skills/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, skillRequest: proposal })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        setDiscoveryResult(data.evaluation)
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDiscovering(false)
    }
  }

  const handleAcceptSkill = async () => {
    if (!discoveryResult || !userId) return

    try {
      setAccepting(true)
      const res = await fetch('/api/skills/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          accept: true,
          name: discoveryResult.name,
          category: discoveryResult.category,
          difficulty: discoveryResult.difficulty,
          description: discoveryResult.description
        })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        // Reset and refresh
        setProposal('')
        setDiscoveryResult(null)
        fetchStatus()
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setAccepting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BODY': return <Heart className="text-red-400" size={16} />
      case 'WEALTH': return <DollarSign className="text-green-400" size={16} />
      case 'MIND': return <Brain className="text-purple-400" size={16} />
      case 'INFLUENCE': return <MessageSquare className="text-blue-400" size={16} />
      default: return <Zap className="text-cyan-400" size={16} />
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
          TUNING SKILL RESONATORS...
        </span>
      </div>
    )
  }

  if (!status?.character) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-400 p-4 text-center">
        <h2 className="text-md font-bold mb-2">Skill Codex Offline</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-4">Initialize your Character Alter Ego from the Hub first.</p>
        <Navbar />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-6 min-h-screen">
      <Header 
        username={status.username}
        title={status.current_title || 'Wanderer'}
        globalLevel={status.global_level}
        globalXp={status.global_xp}
        rank={status.character.current_rank}
        onLogout={logout}
      />

      <div className="p-4 flex flex-col gap-6">
        
        {/* Skill discovery terminal input */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Terminal size={14} className="text-cyan-400" />
            Skill Discovery Terminal
          </h3>

          <div className="glass-panel border-cyan-500/20 p-5 rounded-xl bg-slate-950/60 relative shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <form onSubmit={handleDiscover} className="flex gap-2">
              <input 
                type="text" 
                value={proposal}
                onChange={e => setProposal(e.target.value)}
                placeholder="Suggest skill intent... (e.g. Boxing, Public speaking)"
                required
                disabled={discovering || accepting}
                className="flex-1 bg-slate-900 border border-purple-950/60 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition mono-font"
              />
              <button 
                type="submit" 
                disabled={discovering || accepting}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-50 text-[10px] font-black uppercase tracking-widest px-4 rounded transition active:scale-95 flex-shrink-0"
              >
                {discovering ? '...' : 'DISCOVER'}
              </button>
            </form>

            {/* AI compilation loader */}
            {discovering && (
              <div className="mt-4 text-center border-t border-purple-950/40 pt-4 flex flex-col items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500 mb-2" />
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest animate-pulse mono-font">
                  THE SYSTEM EVALUATING PATHWAY STRANDS...
                </span>
              </div>
            )}

            {/* Discovery output panel */}
            {discoveryResult && (
              <div className="mt-4 border-t border-cyan-500/20 pt-4 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="border border-cyan-500/20 bg-cyan-950/5 p-4 rounded-lg flex flex-col gap-2 relative">
                  {/* Decorative glowing marker */}
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-black text-cyan-400 tracking-wider mono-font">
                    NEW PATH DISCOVERED
                  </span>

                  <div>
                    <h4 className="text-md font-extrabold text-slate-100 rpg-font tracking-wide">
                      {discoveryResult.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold uppercase">
                        {getCategoryIcon(discoveryResult.category)}
                        <span>Category: {discoveryResult.category}</span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                        Difficulty: {discoveryResult.difficulty}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                        Starting Rank: E
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed border-t border-purple-950/30 pt-3 mt-1.5">
                    {discoveryResult.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptSkill}
                    disabled={accepting}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-50 text-[10px] font-black uppercase tracking-wider py-2.5 rounded shadow transition active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Check size={12} />
                    {accepting ? 'SYNCING...' : 'Accept Skill'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setDiscoveryResult(null)
                      setProposal('')
                    }}
                    disabled={accepting}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[10px] uppercase font-black tracking-wider py-2.5 px-4 rounded transition active:scale-95 flex items-center justify-center gap-1"
                  >
                    <X size={12} />
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* List of active skills */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <GitBranch size={14} className="text-purple-400" />
            Tracked Node Architectures
          </h3>

          <div className="flex flex-col gap-2">
            {status.skills.map((skill) => {
              const xpNeeded = skill.level * 100
              const xpPct = Math.min(100, (skill.xp / xpNeeded) * 100)

              return (
                <div key={skill.id} className="glass-panel border-purple-950/40 p-4 rounded-xl flex flex-col gap-3 bg-[#0a0c18]/50">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          {getCategoryIcon(skill.category)}
                          {skill.category}
                        </span>
                      </div>
                      <h4 className="text-md font-bold text-slate-100 mt-2">{skill.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{skill.description}</p>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold leading-none">Rank</span>
                      <span className="text-xl font-black text-cyan-400 rpg-font leading-none mt-1">{skill.rank}</span>
                    </div>
                  </div>

                  {/* Progressive XP and Leveling details */}
                  <div className="border-t border-purple-950/30 pt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Node Level: {skill.level}</span>
                      <span className="mono-font">{skill.xp} / {xpNeeded} XP</span>
                    </div>
                    
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900 relative">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>

      <Navbar />
    </div>
  )
}
