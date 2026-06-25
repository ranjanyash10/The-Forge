'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogIn, UserPlus, Eye, EyeOff, Zap } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { email, username, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        // Store session in localStorage
        localStorage.setItem('forge_userId', data.userId)
        localStorage.setItem('forge_email', data.email)
        localStorage.setItem('forge_username', data.username)
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-purple-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />

      {/* Logo & Title */}
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Shield size={28} className="text-purple-400" />
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            THE FORGE
          </h1>
        </div>
        <p className="text-xs text-cyan-400 uppercase tracking-[0.3em] font-semibold" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          {mode === 'login' ? 'ACCESS THE SYSTEM' : 'INITIALIZE NEW IDENTITY'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-[#0A0D1D]/70 border border-purple-500/15 rounded-2xl p-6 backdrop-blur-lg shadow-[0_0_60px_rgba(168,85,247,0.05)]">
          {/* Mode Toggle */}
          <div className="flex mb-6 bg-slate-950/60 rounded-lg p-1 border border-purple-900/20">
            <button
              onClick={() => { setMode('login'); setError(null) }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-purple-600/30 text-purple-300 shadow-inner border border-purple-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LogIn size={13} />
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(null) }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-cyan-600/30 text-cyan-300 shadow-inner border border-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <UserPlus size={13} />
              Register
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="candidate@theforge.org"
                className="w-full bg-slate-950/60 border border-purple-900/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="YourAlterEgo"
                  className="w-full bg-slate-950/60 border border-purple-900/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-purple-900/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Zap size={14} className="animate-pulse" />
                  {mode === 'login' ? 'AUTHENTICATING...' : 'FORGING IDENTITY...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                  {mode === 'login' ? 'ENTER THE FORGE' : 'INITIALIZE ACCOUNT'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Access */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              localStorage.setItem('forge_userId', 'demo-user-id')
              localStorage.setItem('forge_email', 'demo@theforge.org')
              localStorage.setItem('forge_username', 'ElysianMonarch')
              router.push('/')
            }}
            className="text-[10px] text-slate-500 hover:text-purple-400 uppercase tracking-widest transition-colors font-medium"
          >
            ▸ Access Demo Mode
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-[9px] text-slate-600 uppercase tracking-widest font-medium relative z-10" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
        Forging Legends Since 2026
      </p>
    </div>
  )
}
