'use client'

import { useEffect } from 'react'
import { Award, Zap, Shield, Sparkles, X } from 'lucide-react'

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  questTitle: string
  xpGained: number
  skillName?: string
  globalLevelUp?: boolean
  newGlobalLevel?: number
  unlockedAchievements?: string[]
  unlockedTitles?: string[]
}

export function RewardModal({
  isOpen,
  onClose,
  questTitle,
  xpGained,
  skillName,
  globalLevelUp = false,
  newGlobalLevel,
  unlockedAchievements = [],
  unlockedTitles = []
}: RewardModalProps) {
  
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      {/* Outer Glow Card Wrapper */}
      <div className="w-full max-w-md glass-panel border border-cyan-500/30 rounded-xl overflow-hidden relative shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Background Laser lines */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-slate-950 to-cyan-900/10 pointer-events-none" />
        
        {/* Border Top Accent */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-500" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 p-1 rounded-lg bg-slate-900/40 border border-slate-800 transition"
        >
          <X size={16} />
        </button>

        <div className="p-6 flex flex-col items-center text-center relative z-10 gap-4">
          {/* Header Badge */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-1 rounded-full text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse">
            <Sparkles size={12} />
            Quest Completed
            <Sparkles size={12} />
          </div>

          {/* Quest Name */}
          <h2 className="text-xl font-extrabold text-slate-100 mt-2 tracking-wide leading-snug">
            {questTitle}
          </h2>

          {/* XP Reward Indicator */}
          <div className="my-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Progression Unlocked</span>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 tracking-wider mono-font">
              +{xpGained} XP
            </div>
            {skillName && (
              <span className="text-xs text-purple-400 font-bold uppercase tracking-wider mt-1">
                Refining Skill: {skillName}
              </span>
            )}
          </div>

          {/* Level Up Banner */}
          {globalLevelUp && (
            <div className="w-full bg-gradient-to-r from-amber-600/20 via-amber-500/30 to-amber-600/20 border-y border-amber-500/30 py-2.5 my-1 flex flex-col items-center justify-center gap-1 animate-bounce">
              <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-wider text-sm">
                <Zap size={16} className="fill-amber-400" />
                Level Up Available
              </div>
              <span className="text-xs text-slate-300 font-medium">
                You have ascended to Global Level <strong className="text-amber-300">{newGlobalLevel}</strong>
              </span>
            </div>
          )}

          {/* Unlocked Achievements list */}
          {unlockedAchievements.length > 0 && (
            <div className="w-full flex flex-col gap-2 border-t border-purple-950/40 pt-4 text-left">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">
                Achievements Unlocked ({unlockedAchievements.length})
              </span>
              {unlockedAchievements.map((ach) => (
                <div key={ach} className="flex items-center gap-2.5 bg-purple-950/20 border border-purple-500/10 p-2 rounded">
                  <div className="bg-purple-500/10 p-1 rounded border border-purple-500/20">
                    <Award size={16} className="text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{ach}</h4>
                    <p className="text-[10px] text-slate-400">Earned for completing legendary tasks.</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unlocked Titles list */}
          {unlockedTitles.length > 0 && (
            <div className="w-full flex flex-col gap-2 border-t border-cyan-950/40 pt-4 text-left">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">
                Legendary Titles Forged ({unlockedTitles.length})
              </span>
              {unlockedTitles.map((title) => (
                <div key={title} className="flex items-center gap-2.5 bg-cyan-950/20 border border-cyan-500/10 p-2 rounded">
                  <div className="bg-cyan-500/10 p-1 rounded border border-cyan-500/20">
                    <Shield size={16} className="text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{title}</h4>
                    <p className="text-[10px] text-slate-400">Equip this title in your character codex.</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gradient-to-r from-purple-700 to-cyan-600 hover:from-purple-600 hover:to-cyan-500 text-slate-50 border border-purple-500/30 py-3 rounded-lg font-bold uppercase tracking-wider text-xs shadow-lg transition active:scale-98"
          >
            Acknowledge Progression
          </button>
        </div>
      </div>
    </div>
  )
}
