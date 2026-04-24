import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid credentials')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-nephele-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <p className="text-4xl mb-2">☁️</p>
          <h1 className="greek text-3xl font-light tracking-widest mb-1">ΝΕΦΕΛΗ</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-nephele-grey border-t border-nephele-border pt-3 mt-3 inline-block">Authorized Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Admin Email"
              required
              className="w-full bg-nephele-dim border border-nephele-border px-4 py-3 text-xs tracking-wider focus:outline-none focus:border-nephele-grey transition-colors placeholder:text-nephele-border"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-nephele-dim border border-nephele-border px-4 py-3 text-xs focus:outline-none focus:border-nephele-grey transition-colors placeholder:text-nephele-border"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center border border-red-500/20 bg-red-500/5 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nephele-white text-nephele-black py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In to Hub'}
          </button>
        </form>
      </div>
    </div>
  )
}
