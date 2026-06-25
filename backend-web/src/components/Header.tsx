'use client'

import { Shield, LogOut } from 'lucide-react'

interface HeaderProps {
  username?: string
  title?: string
  globalLevel?: number
  globalXp?: number
  rank?: string
  onLogout?: () => void
}

export function Header({ 
  username = 'Candidate', 
  title = 'Wanderer', 
  globalLevel = 1, 
  globalXp = 0, 
  rank = 'E',
  onLogout
}: HeaderProps) {
  
  // Calculate XP required
  const xpNeeded = globalLevel * 100
  const xpPercentage = Math.min(100, Math.max(0, (globalXp / xpNeeded) * 100))

  return (
    <div className="w-full glass-panel border-b border-purple-950/60 p-4 flex flex-col gap-3 relative overflow-hidden bg-[#070913]/90">
      {/* Background neon visual line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-500" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 tracking-wider">
            THE FORGE
          </h1>
          <p className="text-xs uppercase text-cyan-400 tracking-widest rpg-font drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">
            {title}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Rank HUD Badge */}
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded border border-purple-500/20 shadow-inner">
            <Shield size={16} className="text-purple-400" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">Rank</span>
              <span className="text-sm font-bold text-purple-300 rpg-font leading-none">{rank}</span>
            </div>
          </div>
          
          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-slate-900/60 p-2 rounded border border-red-500/15 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Global XP & Level Progress */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-end text-xs">
          <span className="rpg-font text-[10px] text-slate-400 font-bold uppercase">
            Global Progression
          </span>
          <span className="mono-font text-slate-300 font-semibold">
            LVL {globalLevel} <span className="text-slate-500">({globalXp}/{xpNeeded} XP)</span>
          </span>
        </div>
        {/* Glow progress bar container */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full border border-purple-500/10 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-500 relative shimmer-progress"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
