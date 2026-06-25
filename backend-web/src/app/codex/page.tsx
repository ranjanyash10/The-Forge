'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/lib/useAuth'
import { Award, Shield, User, Sparkles, BookOpen, Clock, Heart, Zap } from 'lucide-react'

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
    origin_story: string
    avatar_url: string
    current_rank: string
    snapshots: Array<{
      id: string
      avatar_url: string
      rank: string
      level: number
      title: string
      narrative: string
      created_at: string
    }>
  }
  achievements: Array<{
    achievement: {
      id: string
      name: string
      description: string
      badge: string
      unlock_requirements: string
    }
  }>
  titles: Array<{
    title: {
      id: string
      name: string
      description: string
      unlock_requirements: string
    }
  }>
}

interface AllTitle {
  id: string
  name: string
  description: string
}

interface AllAchievement {
  id: string
  name: string
  description: string
  badge: string
}

export default function CharacterCodex() {
  const { userId, isReady, logout } = useAuth()
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [equipping, setEquipping] = useState<string | null>(null)

  // Hardcode lists of all seeded titles/achievements to display locked versions
  const allTitles: AllTitle[] = [
    { id: 'Wanderer', name: 'Wanderer', description: 'A blank slate. Seeking purpose in the dynamic expanse.' },
    { id: 'Pathfinder', name: 'Pathfinder', description: 'One who steps off the beaten track. Gained by mapping out skills.' },
    { id: 'Ascendant', name: 'Ascendant', description: 'Rising above the average. Gained through consistent progression.' },
    { id: 'Monarch', name: 'Monarch', description: 'Ruler of one\'s domain. Reserved for high ranks and legendary efforts.' },
    { id: 'Sovereign', name: 'Sovereign', description: 'Complete autonomy. Gained through mastery in wealth and mind.' },
    { id: 'Eternal', name: 'Eternal', description: 'A legend carved in stone. Legacy that echoes in The Forge.' },
  ]

  const allAchievements: AllAchievement[] = [
    { id: 'First Workout', name: 'First Workout', description: 'Took the first step in forging the physical body.', badge: 'shield' },
    { id: 'First 100 XP', name: 'First 100 XP', description: 'Accumulate 100 global XP.', badge: 'award' },
    { id: 'Level 10 Reached', name: 'Level 10 Reached', description: 'Hit double digits in your global progression.', badge: 'zap' },
    { id: '100 Deep Work Hours', name: '100 Deep Work Hours', description: 'Maintained intense mental focus for 100 hours.', badge: 'book-open' },
    { id: 'First Client', name: 'First Client', description: 'Secured currency in exchange for high-level skill.', badge: 'sparkles' },
    { id: '10kg Lost', name: '10kg Lost', description: 'Shed weight through iron discipline.', badge: 'heart' },
    { id: '100 Consecutive Days Logged', name: '100 Consecutive Days Logged', description: 'A hundred days of consistent entries.', badge: 'clock' },
  ]

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

  const equipTitle = async (titleId: string) => {
    if (!userId) return
    try {
      setEquipping(titleId)
      const res = await fetch('/api/character/equip-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, titleId })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        // Refresh
        fetchStatus()
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setEquipping(null)
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
          TUNING CODEX FREQUENCIES...
        </span>
      </div>
    )
  }

  if (!status?.character) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-400 p-4 text-center">
        <h2 className="text-md font-bold mb-2">Character Sheet Offline</h2>
        <p className="text-xs text-slate-500 max-w-xs mb-4">Initialize your Character Alter Ego from the Hub first.</p>
        <Navbar />
      </div>
    )
  }

  // Set of unlocked IDs
  const unlockedTitleIds = new Set(status.titles.map(t => t.title.id))
  const unlockedAchievementIds = new Set(status.achievements.map(a => a.achievement.id))

  // Render achievement icon based on tag
  const renderBadgeIcon = (iconName: string, active: boolean) => {
    const color = active ? 'text-cyan-400' : 'text-slate-600'
    switch (iconName) {
      case 'shield': return <Shield className={color} size={20} />
      case 'award': return <Award className={color} size={20} />
      case 'zap': return <Zap className={color} size={20} />
      case 'book-open': return <BookOpen className={color} size={20} />
      case 'sparkles': return <Sparkles className={color} size={20} />
      case 'heart': return <Heart className={color} size={20} />
      case 'clock': return <Clock className={color} size={20} />
      default: return <Award className={color} size={20} />
    }
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
        
        {/* Profile Card */}
        <section className="glass-panel p-5 rounded-xl flex flex-col items-center text-center gap-4 relative overflow-hidden bg-[#060814]/80">
          <div className="absolute top-0 right-0 p-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mono-font">
            Dossier No. 0421
          </div>
          
          <div className="w-20 h-20 rounded border-2 border-purple-500 glow-purple overflow-hidden bg-slate-950">
            <img src={status.character.avatar_url} alt={status.character.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-100">{status.character.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs uppercase text-cyan-400 tracking-widest rpg-font font-semibold">
                {status.character.class}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="text-xs uppercase text-purple-400 font-bold tracking-wider mono-font">
                Rank {status.character.current_rank}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed border-t border-purple-950/40 pt-4 px-2 max-w-sm italic">
            "{status.character.origin_story}"
          </p>
        </section>

        {/* Titles Equipper */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Shield size={14} className="text-cyan-400" />
            Forge Titles
          </h3>

          <div className="flex flex-col gap-2">
            {allTitles.map((title) => {
              const isUnlocked = unlockedTitleIds.has(title.id)
              const isEquipped = status.current_title === title.id

              return (
                <div 
                  key={title.id} 
                  className={`border p-3.5 rounded-xl flex items-center justify-between gap-3 transition ${
                    isEquipped 
                      ? 'border-cyan-500/30 bg-cyan-500/5' 
                      : isUnlocked 
                        ? 'border-purple-950/40 bg-slate-950/40' 
                        : 'border-slate-950 bg-slate-950/10 opacity-40'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-200">{title.name}</h4>
                      {isEquipped && (
                        <span className="bg-cyan-500/10 text-cyan-300 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase">
                          Equipped
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{title.description}</p>
                  </div>

                  {isUnlocked && !isEquipped && (
                    <button
                      onClick={() => equipTitle(title.id)}
                      disabled={equipping !== null}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded transition active:scale-95 flex-shrink-0"
                    >
                      {equipping === title.id ? '...' : 'Equip'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Achievements Codex */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-purple-400" />
            Legendary Achievements
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {allAchievements.map((ach) => {
              const isUnlocked = unlockedAchievementIds.has(ach.id)

              return (
                <div 
                  key={ach.id}
                  className={`border p-3.5 rounded-xl flex items-center gap-3.5 transition ${
                    isUnlocked 
                      ? 'border-purple-500/20 bg-purple-500/5' 
                      : 'border-slate-950 bg-slate-950/10 opacity-30'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border flex-shrink-0 ${
                    isUnlocked 
                      ? 'bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    {renderBadgeIcon(ach.badge, isUnlocked)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{ach.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Snapshots comparison */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-amber-400" />
            Character Snapshots
          </h3>

          {status.character.snapshots.length === 0 ? (
            <div className="text-center p-6 bg-slate-950/30 rounded border border-purple-950/20 text-xs text-slate-500">
              No historical milestones captured. Snapshots are compiled on weekly chapter releases.
            </div>
          ) : (
            <div className="relative border-l border-purple-950/60 pl-4 ml-2 flex flex-col gap-4">
              {status.character.snapshots.map((snap) => (
                <div key={snap.id} className="relative flex flex-col gap-1 bg-[#0a0d18]/40 border border-purple-950/30 p-3 rounded-lg shadow-sm">
                  {/* Timeline dot */}
                  <span className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7] border border-[#060814]" />
                  
                  <div className="flex justify-between items-center flex-wrap">
                    <span className="text-[10px] text-slate-500 font-bold uppercase mono-font">
                      {new Date(snap.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' })}
                    </span>
                    <span className="text-[8px] bg-purple-950/60 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider">
                      Lvl {snap.level} Rank {snap.rank}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider rpg-font">
                    Title: {snap.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {snap.narrative}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      <Navbar />
    </div>
  )
}
