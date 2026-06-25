'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/lib/useAuth'
import { Book, History, Sparkles, BookOpen, Clock } from 'lucide-react'

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

interface Chapter {
  id: string
  chapter_number: number
  title: string
  narrative: string
  created_at: string
}

export default function ArchivesTimeline() {
  const { userId, isReady, logout } = useAuth()
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  
  // Weekly Chapter creation state
  const [compiling, setCompiling] = useState(false)

  const fetchStatus = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/character/status?userId=${userId}`)
      const data = await res.json()
      if (!data.error) {
        setStatus(data.user)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchChapters = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/weekly-chapter?userId=${userId}`)
      const data = await res.json()
      if (!data.error) {
        setChapters(data.chapters)
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
      fetchChapters()
    }
  }, [isReady, userId])

  const handleCompileChapter = async () => {
    if (!userId) return
    try {
      setCompiling(true)
      const res = await fetch('/api/weekly-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        // Refresh chapter timeline and status
        fetchChapters()
        fetchStatus()
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setCompiling(false)
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
          OPENING SYSTEM NARRATIVE CORES...
        </span>
      </div>
    )
  }

  if (!status?.character) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-400 p-4 text-center">
        <h2 className="text-md font-bold mb-2">Archives Offline</h2>
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
        
        {/* Weekly chapter creation module */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Book size={14} className="text-cyan-400" />
            Archives Compilation
          </h3>

          <div className="glass-panel border-cyan-500/20 p-5 rounded-xl bg-slate-950/60 relative text-center flex flex-col gap-3.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 rpg-font block">
              Narrative Compiler
            </span>
            <p className="text-xs text-slate-400 leading-normal max-w-md mx-auto">
              Ready to merge today's logs and XP logs into an epic weekly chronicle chapter?
            </p>
            
            <button
              onClick={handleCompileChapter}
              disabled={compiling}
              className="bg-gradient-to-r from-purple-700 to-cyan-600 border border-purple-500/30 text-xs font-black uppercase tracking-widest py-3 rounded-lg hover:from-purple-600 hover:to-cyan-500 transition disabled:opacity-50 mt-1 max-w-xs mx-auto w-full shadow-lg"
            >
              {compiling ? 'COMPILING CHRONICLE...' : 'FORGE WEEKLY CHAPTER'}
            </button>
          </div>
        </section>

        {/* Chapters timeline list */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
            <History size={14} className="text-purple-400" />
            Chronicle of the Forge
          </h3>

          {chapters.length === 0 ? (
            <div className="text-center p-8 bg-slate-950/20 rounded border border-purple-950/20 text-xs text-slate-500">
              No weekly chapters forged. Compile your first chapter using the console above.
            </div>
          ) : (
            <div className="relative border-l border-cyan-500/20 pl-4 ml-2 flex flex-col gap-6">
              {chapters.map((chap) => (
                <div key={chap.id} className="relative flex flex-col gap-2 bg-[#05070e]/60 border border-cyan-500/10 p-4 rounded-xl shadow-md">
                  
                  {/* Glowing marker dot */}
                  <span className="absolute -left-[21px] top-5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] border border-[#02040a]" />

                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider rpg-font">
                      Chapter {chap.chapter_number}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold mono-font">
                      {new Date(chap.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-100 mt-1 tracking-wide uppercase rpg-font">
                    {chap.title.split(': ').length > 1 ? chap.title.split(': ')[1] : chap.title}
                  </h4>

                  <p className="text-xs text-slate-350 leading-relaxed mt-2 border-t border-slate-900 pt-3 italic">
                    "{chap.narrative}"
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
