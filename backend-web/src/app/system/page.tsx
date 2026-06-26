'use client'

import { useEffect, useState, useRef } from 'react'
import { Header } from '@/components/Header'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/lib/useAuth'
import { Terminal, Send, Cpu, Shield, Zap, Sparkles, Brain, AlertCircle } from 'lucide-react'

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
    avatar_url: string
    current_rank: string
  }
}

interface Message {
  id: string
  sender: 'SYSTEM' | 'USER'
  content: string
  created_at: string
}

export default function SystemChat() {
  const { userId, isReady, logout } = useAuth()
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const fetchHistory = async () => {
    if (!userId) return
    try {
      setHistoryLoading(true)
      const res = await fetch(`/api/system/history?userId=${userId}`)
      const data = await res.json()
      if (!data.error) {
        setMessages(data.messages || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (isReady && userId) {
      fetchStatus()
      fetchHistory()
    }
  }, [isReady, userId])

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim()
    if (!text || !userId || loading) return

    setInput('')
    setLoading(true)

    // Optimistically add user message to list
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      sender: 'USER',
      content: text,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const res = await fetch('/api/system/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        // Fetch history or append the reply
        const tempSystemMsg: Message = {
          id: Math.random().toString(),
          sender: 'SYSTEM',
          content: data.reply,
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempSystemMsg])
        
        // Refresh character status in case states or stats changed
        fetchStatus()
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    { label: 'Request Dynamic Quest', text: 'I need a new quest. Assign me a priority target.' },
    { label: 'Report High Exhaustion', text: 'I am feeling extremely tired and stressed today.' },
    { label: 'Record Epic Success', text: 'I just finished a major sprint and achieved a success milestone!' }
  ]

  if (!isReady || !userId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4" />
        <span className="mono-font text-xs uppercase tracking-widest text-slate-400 animate-pulse">
          Securing Nexus Connection...
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-6 min-h-screen animate-in fade-in duration-300">
      {status && (
        <Header 
          username={status.username}
          title={status.current_title || 'Wanderer'}
          globalLevel={status.global_level}
          globalXp={status.global_xp}
          rank={status.character?.current_rank || 'E'}
          onLogout={logout}
        />
      )}

      <div className="p-4 flex-1 flex flex-col max-w-2xl w-full mx-auto gap-4">
        
        {/* Core System Dashboard Info */}
        <div className="glass-panel border-cyan-500/10 p-3 rounded-xl bg-[#090c18]/50 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/10 p-2 rounded border border-cyan-500/30">
              <Cpu size={14} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Interface Node</span>
              <span className="mono-font text-slate-300 font-extrabold text-[11px]">THE_SYSTEM_V2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#05070f] border border-cyan-500/20 px-2.5 py-1 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] mono-font text-cyan-400 uppercase tracking-widest font-black">Online</span>
          </div>
        </div>

        {/* Chat Console Log */}
        <div className="flex-1 min-h-[350px] bg-slate-950/45 border border-purple-950/60 rounded-xl flex flex-col overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          
          {/* Background matrix glow effects */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {historyLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Reading conversation matrices...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-3">
                <Brain size={24} className="text-purple-500/40" />
                <span className="text-xs">No synchronization files found. Initialize system greetings.</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isSystem = msg.sender === 'SYSTEM'
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isSystem ? 'self-start items-start' : 'self-end items-end'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className={`text-[8px] uppercase tracking-wider font-extrabold ${
                        isSystem ? 'text-purple-400' : 'text-cyan-400'
                      }`}>
                        {isSystem ? '▸ THE SYSTEM' : '▸ CANDIDATE'}
                      </span>
                    </div>
                    
                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isSystem 
                        ? 'bg-[#0f1122]/95 border-purple-950/70 text-slate-200 mono-font' 
                        : 'bg-cyan-950/20 border-cyan-500/20 text-slate-100'
                    }`}>
                      {msg.content.split('\n').map((line, idx) => (
                        <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-1 last:mb-0'}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })
            )}

            {loading && (
              <div className="self-start flex flex-col items-start max-w-[85%]">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[8px] text-purple-400 uppercase tracking-wider font-extrabold">▸ THE SYSTEM</span>
                </div>
                <div className="p-3.5 rounded-xl border bg-[#0f1122]/95 border-purple-950/70 text-slate-400 text-xs mono-font flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-75" />
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-150" />
                  <span className="text-[10px] tracking-widest text-purple-400 font-bold ml-1 uppercase animate-pulse">Calculating response matrices...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions panel */}
          {!historyLoading && (
            <div className="p-3 border-t border-purple-950/60 bg-[#060812]/90 flex gap-2 overflow-x-auto select-none">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.text)}
                  disabled={loading}
                  className="bg-slate-900 hover:bg-[#0c0f24] hover:border-cyan-500/30 border border-slate-800 text-[10px] text-slate-300 font-bold px-3 py-2 rounded-lg transition whitespace-nowrap flex-shrink-0 disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {/* Input text bar */}
          <div className="p-3 border-t border-purple-950/60 bg-[#060812] flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage(input)}
              placeholder={loading ? "System processing..." : "Relay command to The System..."}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-purple-950/60 p-3 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || loading}
              className="bg-purple-800 hover:bg-purple-700 disabled:bg-slate-800 text-slate-200 hover:text-slate-100 p-3 rounded-lg flex items-center justify-center transition disabled:opacity-50 active:scale-95"
            >
              <Send size={15} />
            </button>
          </div>

        </div>

      </div>

      <Navbar />
    </div>
  )
}
