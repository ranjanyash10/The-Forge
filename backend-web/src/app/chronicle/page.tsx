'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/lib/useAuth'
import { PenTool, Heart, Flame, Sparkles, Check, ChevronRight, Play, Compass, Award } from 'lucide-react'

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
    avatar_url: string
    current_rank: string
  }
}

interface XpTrans {
  skillName: string
  xpGained: number
  reason: string
}

interface SpawnQuest {
  id: string
  title: string
  description: string
  xp_reward: number
  quest_type: string
}

interface DailySummaryResult {
  notes: string
  mood: string
  energy: number
  analysis: string
  xpTransactions: XpTrans[]
  spawnedQuests: SpawnQuest[]
  strengths: string
  weaknesses: string
}

export default function DailyChronicle() {
  const { userId, isReady, logout } = useAuth()
  const [status, setStatus] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Form input states
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState('FOCUSED')
  const [energy, setEnergy] = useState(7)
  const [weight, setWeight] = useState('')

  // Submission states
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DailySummaryResult | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim() || !userId) return

    try {
      setSubmitting(true)
      setResult(null)
      const res = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          notes,
          mood,
          energy,
          weight
        })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        setResult({
          notes,
          mood,
          energy,
          analysis: data.analysis,
          xpTransactions: data.xpTransactions,
          spawnedQuests: data.spawnedQuests,
          strengths: data.strengths,
          weaknesses: data.weaknesses
        })
        setNotes('')
        setMood('FOCUSED')
        setEnergy(7)
        setWeight('')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSubmitting(false)
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
          OPENING ARCHIVAL CHRONICLES...
        </span>
      </div>
    )
  }

  if (!status?.character) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-400 p-4 text-center">
        <h2 className="text-md font-bold mb-2">Chronicle Offline</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-4">Initialize your Character Alter Ego from the Hub first.</p>
        <Navbar />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-6 min-h-screen relative">
      <Header 
        username={status.username}
        title={status.current_title || 'Wanderer'}
        globalLevel={status.global_level}
        globalXp={status.global_xp}
        rank={status.character.current_rank}
        onLogout={logout}
      />

      <div className="p-4 flex flex-col gap-6">
        
        {!result ? (
          /* Submission Screen */
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <PenTool size={14} className="text-cyan-400" />
                Inscribe Daily Chronicle
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Report today's real-life actions to The System. Narratives evolve based on your diligence.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-slate-950/40 p-4 rounded-xl border border-purple-950/60 glass-panel">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Deeds of the Day</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Today I ran 5km, did 2 hours of focus coding on the database and secured a client meeting..."
                  required
                  rows={5}
                  disabled={submitting}
                  className="bg-slate-900 border border-purple-950/60 rounded p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Dominant Mood</label>
                  <select
                    value={mood}
                    onChange={e => setMood(e.target.value)}
                    disabled={submitting}
                    className="bg-slate-900 border border-purple-950/60 rounded p-2.5 text-xs text-slate-200 focus:outline-none w-full"
                  >
                    <option value="FOCUSED">Focused</option>
                    <option value="DETERMINED">Determined</option>
                    <option value="EXHAUSTED">Exhausted</option>
                    <option value="REBUILDING">Rebuilding</option>
                    <option value="FLOW">Flow State</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Weight (Updates Bio)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="e.g. 78.5 kg"
                    disabled={submitting}
                    className="bg-slate-900 border border-purple-950/60 rounded p-2.5 text-xs text-slate-200 focus:outline-none w-full placeholder-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex justify-between">
                    <span>Energy</span>
                    <span className="mono-font text-cyan-400">{energy}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={e => setEnergy(parseInt(e.target.value))}
                    disabled={submitting}
                    className="h-2 bg-slate-900 border border-purple-950/60 rounded-lg appearance-none cursor-pointer mt-3 accent-cyan-500 w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-700 to-cyan-600 border border-purple-500/30 text-xs font-black uppercase tracking-widest py-3.5 rounded-lg text-slate-50 hover:from-purple-600 hover:to-cyan-500 transition disabled:opacity-50 mt-1 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/20"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-50" />
                    TRANSLATING RECONSTRUCTION...
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-slate-50" />
                    INSCRIBE IN CHRONICLE
                  </>
                )}
              </button>
            </form>

            {/* Live Streak Calendar */}
            <div className="bg-slate-950/40 border border-purple-950/60 p-4 rounded-xl glass-panel mt-2">
              <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-3">Daily Chronicle Calendar</h4>
              
              <div className="grid grid-cols-7 gap-1.5 text-center text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              
              <div className="grid grid-cols-7 gap-1.5">
                {(() => {
                  const today = new Date()
                  const year = today.getFullYear()
                  const month = today.getMonth()
                  const firstDay = new Date(year, month, 1)
                  const startDayOfWeek = firstDay.getDay()
                  const totalDays = new Date(year, month + 1, 0).getDate()
                  
                  const days = []
                  for (let i = 0; i < startDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square" />)
                  }
                  
                  for (let d = 1; d <= totalDays; d++) {
                    const currentDate = new Date(year, month, d)
                    const isToday = today.getDate() === d
                    
                    const isLogged = status?.dailyLogs?.some((log: any) => {
                      const logDate = new Date(log.created_at)
                      return logDate.getDate() === d && 
                             logDate.getMonth() === month && 
                             logDate.getFullYear() === year
                    })
                    
                    let bgClass = 'bg-slate-900/50 border border-purple-950/20 text-slate-400'
                    if (isLogged) {
                      bgClass = 'bg-gradient-to-br from-purple-950 to-cyan-950 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-pulse'
                    } else if (isToday) {
                      bgClass = 'bg-slate-900 border border-purple-500 text-purple-400 font-black'
                    }
                    
                    days.push(
                      <div 
                        key={`day-${d}`} 
                        title={isLogged ? 'Chronicle Inscribed' : isToday ? 'Awaiting Inscription' : ''}
                        className={`aspect-square flex items-center justify-center rounded-lg text-[10px] font-bold ${bgClass} transition-all`}
                      >
                        {d}
                      </div>
                    )
                  }
                  return days
                })()}
              </div>
            </div>
          </div>
        ) : (
          /* Post-Match Reward Summary overlay panel */
          <div className="glass-panel border-cyan-500/20 p-5 rounded-xl flex flex-col gap-5 relative bg-[#04060f]/95 shadow-[0_0_40px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-500">
            {/* Header banner */}
            <div className="text-center pb-3 border-b border-purple-950/40">
              <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-500/20 animate-pulse">
                Chronicle Evaluation Successful
              </span>
              <h2 className="text-lg font-black text-slate-100 mt-3 tracking-wide">DAILY REWARD MOMENT</h2>
            </div>

            {/* AI Narrative section */}
            <div className="bg-[#0b0c16]/80 border border-purple-950/60 p-4 rounded-lg relative overflow-hidden">
              <div className="absolute top-2 left-2 text-[8px] font-bold text-slate-500 uppercase tracking-wider mono-font">
                System Narration
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic mt-2">
                "{result.analysis}"
              </p>
            </div>

            {/* XP Transactions List */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">
                Experience Distributed
              </span>
              <div className="flex flex-col gap-1.5">
                {result.xpTransactions.map((tx, idx) => (
                  <div key={idx} className="bg-purple-950/15 border border-purple-500/10 p-2.5 rounded flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-200 block truncate">{tx.skillName} Node</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{tx.reason}</span>
                    </div>
                    <span className="text-sm font-black text-purple-300 mono-font">+{tx.xpGained} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested/Spawned Quests */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">
                New Quests Logged for Tomorrow
              </span>
              <div className="flex flex-col gap-1.5">
                {result.spawnedQuests.map((q) => (
                  <div key={q.id} className="bg-slate-900/60 border border-purple-950/40 p-2.5 rounded flex items-center gap-3">
                    <div className="bg-purple-500/10 p-1.5 rounded border border-purple-500/20 text-purple-400 flex-shrink-0">
                      <Compass size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{q.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{q.description}</p>
                    </div>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-black mono-font">
                      +{q.xp_reward} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-2 border-t border-purple-950/40 pt-4">
              <div className="bg-cyan-950/10 border border-cyan-500/10 p-2.5 rounded">
                <span className="text-[8px] uppercase tracking-wider text-cyan-400 font-black flex items-center gap-1">
                  <Flame size={10} className="fill-cyan-400" />
                  Apex Attribute
                </span>
                <p className="text-[10px] text-slate-300 leading-normal mt-1">{result.strengths}</p>
              </div>

              <div className="bg-purple-950/10 border border-purple-500/10 p-2.5 rounded">
                <span className="text-[8px] uppercase tracking-wider text-purple-400 font-black flex items-center gap-1">
                  <PenTool size={10} />
                  System Threat
                </span>
                <p className="text-[10px] text-slate-300 leading-normal mt-1">{result.weaknesses}</p>
              </div>
            </div>

            {/* Acknowledge Button */}
            <button
              onClick={() => {
                setResult(null)
                fetchStatus()
              }}
              className="w-full bg-gradient-to-r from-purple-700 to-cyan-600 border border-purple-500/30 text-xs font-black uppercase tracking-widest py-3 rounded-lg hover:from-purple-600 hover:to-cyan-500 transition shadow-lg mt-1"
            >
              Acknowledge Progression
            </button>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
