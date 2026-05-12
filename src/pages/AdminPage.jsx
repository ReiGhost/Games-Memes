import { useState, useEffect } from 'react'
import { Shield, Users, Trash2, ChevronUp, ChevronDown, Search, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  user:  { label: 'Usuário',      color: '#4A2015', bg: 'rgba(74,32,21,0.1)'  },
  mod:   { label: 'Moderador',    color: '#1A4A8A', bg: 'rgba(26,74,138,0.1)' },
  admin: { label: 'Administrador',color: '#7A1515', bg: 'rgba(122,21,21,0.1)' },
}

export function AdminPage() {
  const { isAdmin, loading } = useAuth()
  const navigate             = useNavigate()
  const [users, setUsers]    = useState([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch]  = useState('')
  const [saving, setSaving]  = useState(null)

  useEffect(() => {
    if (!loading && !isAdmin) { navigate('/'); return }
    loadUsers()
  }, [loading, isAdmin])

  async function loadUsers() {
    setFetching(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, ninja_rank, role, created_at')
      .order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    else setUsers(data || [])
    setFetching(false)
  }

  async function setRole(userId, newRole) {
    setSaving(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    setSaving(null)
    if (error) { toast.error(error.message); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    toast.success('Role atualizado!')
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--red)' }}>
          <Shield size={20} style={{ color: 'var(--gold)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1 }}>
            PAINEL ADMIN
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>
            Gerenciamento de usuários e permissões
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',       value: users.length,                                  color: 'var(--text)' },
          { label: 'Moderadores', value: users.filter(u => u.role === 'mod').length,    color: '#1A4A8A' },
          { label: 'Admins',      value: users.filter(u => u.role === 'admin').length,  color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-ninja p-4 text-center">
            <p style={{ fontFamily: "'Russo One', sans-serif", fontSize: '1.8rem', color, lineHeight: 1 }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-lt)' }} />
        <input
          className="input-ninja pl-9"
          placeholder="Buscar usuário..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users table */}
      <div className="card-ninja overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(201,162,39,0.2)', background: 'var(--surface-2)' }}
        >
          <Users size={15} style={{ color: 'var(--text-lt)' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-m)' }}>
            Usuários ({filtered.length})
          </span>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--red)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-lt)' }}>Nenhum usuário encontrado</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(201,162,39,0.1)' }}>
            {filtered.map(u => {
              const r = ROLE_LABELS[u.role] || ROLE_LABELS.user
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--gold)', color: '#1E0D07', fontFamily: 'Inter, sans-serif' }}
                  >
                    {(u.username || '?')[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>
                      {u.username}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>
                      {u.ninja_rank}
                    </p>
                  </div>

                  {/* Role badge */}
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: r.bg, color: r.color, fontFamily: 'Inter, sans-serif', border: `1px solid ${r.color}30` }}
                  >
                    {r.label}
                  </span>

                  {/* Role buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {saving === u.id ? (
                      <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-lt)' }} />
                    ) : (
                      <>
                        {u.role !== 'user' && (
                          <button
                            onClick={() => setRole(u.id, 'user')}
                            className="px-2 py-1 rounded text-xs transition-colors hover:bg-red-50"
                            style={{ color: 'var(--red)', fontFamily: 'Inter, sans-serif', border: '1px solid rgba(122,21,21,0.2)' }}
                            title="Rebaixar para usuário"
                          >
                            Usuário
                          </button>
                        )}
                        {u.role !== 'mod' && (
                          <button
                            onClick={() => setRole(u.id, 'mod')}
                            className="px-2 py-1 rounded text-xs transition-colors hover:bg-blue-50"
                            style={{ color: '#1A4A8A', fontFamily: 'Inter, sans-serif', border: '1px solid rgba(26,74,138,0.2)' }}
                            title="Tornar moderador"
                          >
                            Mod
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setRole(u.id, 'admin')}
                            className="px-2 py-1 rounded text-xs transition-colors"
                            style={{ color: 'var(--red)', fontFamily: 'Inter, sans-serif', border: '1px solid rgba(122,21,21,0.2)', background: 'rgba(122,21,21,0.05)' }}
                            title="Tornar administrador"
                          >
                            Admin
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
