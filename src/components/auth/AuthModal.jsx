import { useState } from 'react'
import { X, Eye, EyeOff, User, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { DragonHeadIcon } from '../ui/DragonDivider'

export function AuthModal({ onClose, initialTab = 'login' }) {
  const [tab, setTab]             = useState(initialTab)
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const { signIn, signUp }        = useAuth()

  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn({ email: form.email, password: form.password })
      toast.success('Bem-vindo de volta, ninja!')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!form.username.trim()) { toast.error('Escolha um nome ninja'); return }
    if (form.password.length < 6) { toast.error('Senha precisa ter ao menos 6 caracteres'); return }
    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, username: form.username })
      toast.success('Conta criada! Verifique seu e-mail.')
      onClose()
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full max-w-md animate-fade-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 20px 60px rgba(30,13,7,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-6 py-4"
          style={{ background: 'linear-gradient(135deg, #5C0E0E 0%, #7A1515 100%)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <DragonHeadIcon size={32} />
            <span className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold-lt)' }}>
              {tab === 'login' ? 'Entrar' : 'Criar Conta'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: 'rgba(248,235,195,0.7)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(201,162,39,0.25)', background: 'var(--surface-2)' }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 font-cinzel text-sm transition-colors ${tab === t ? 'tab-active' : 'tab-inactive'}`}
              style={{ color: tab === t ? 'var(--red)' : 'var(--text-lt)', borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent' }}
            >
              {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
            {tab === 'register' && (
              <label className="flex flex-col gap-1">
                <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>
                  NOME NINJA
                </span>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-lt)' }} />
                  <input
                    type="text"
                    className="input-ninja pl-9"
                    placeholder="Seu nome na comunidade"
                    value={form.username}
                    onChange={set('username')}
                    required
                    autoComplete="username"
                  />
                </div>
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>
                E-MAIL
              </span>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-lt)' }} />
                <input
                  type="email"
                  className="input-ninja pl-9"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>
                SENHA
              </span>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-lt)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-ninja pl-9 pr-10"
                  placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-lt)' }}
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button type="submit" className="btn-ninja justify-center mt-2" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                : tab === 'login' ? 'Entrar na Dojô' : 'Criar Conta de Ninja'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-lt)' }}>
            {tab === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className="font-semibold underline"
              style={{ color: 'var(--red-mid)' }}
            >
              {tab === 'login' ? 'Cadastre-se' : 'Entre aqui'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
