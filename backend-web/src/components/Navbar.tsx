'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, GitBranch, PenTool, History } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Hub', path: '/', icon: LayoutDashboard },
    { name: 'Codex', path: '/codex', icon: BookOpen },
    { name: 'Skills', path: '/skills', icon: GitBranch },
    { name: 'Chronicle', path: '/chronicle', icon: PenTool },
    { name: 'Archives', path: '/archives', icon: History },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-[#05070f]/95 border-t border-purple-950/60 backdrop-blur-md px-4 py-2 max-w-md md:max-w-2xl mx-auto md:relative md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <div className="flex w-full justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all duration-300 relative ${
                isActive 
                  ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className="mb-0.5" />
              <span className="text-[10px] uppercase font-semibold tracking-wider rpg-font">
                {item.name}
              </span>
              
              {/* Active glow dot */}
              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
