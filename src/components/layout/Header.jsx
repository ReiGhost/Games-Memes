import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogIn, LogOut, User, Menu, X, Youtube } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import { DragonHeadIcon } from '../ui/DragonDivider'
import { NinjargonText } from '../ui/NinjargonText'

const NAV = [
  { label: 'Blog',        path: '/'          },
  { label: 'Comunidade',  path: '/comunidade' },
  { label: 'Chat',        path: '/chat'       },
]

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [authModal, setAuthModal]  = useState(null)
  const [menuOpen, setMenuOpen]    = useState(false)
  const [userMenu, setUserMenu]    = useState(false)
  const location = useLocation()

  function activeTab(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header style={{ background: 'linear-gradient(180deg, #4A0E0E 0%, #6B1414 50%, #7A1515 100%)', borderBottom: '2px solid var(--border)' }}>

        {/* Top strip - YouTube */}
        <div
          className="flex items-center justify-center gap-2 py-1 px-4"
          style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(201,162,39,0.2)' }}
        >
          <Youtube size={13} style={{ color: '#FF4444' }} />
          <span className="font-cinzel text-xs" style={{ color: 'rgba(248,235,195,0.7)', letterSpacing: '0.05em' }}>
            Inscreva-se no canal:
          </span>
          <a
            href="https://youtube.com/@rei_bricks?si=nHoaOhxsrtK23Yvq"
            target="_blank"
            rel="noopener noreferrer"
            className="font-cinzel text-xs font-semibold hover:underline transition-colors"
            style={{ color: 'var(--gold-lt)' }}
          >
            @rei_bricks
          </a>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1.5px solid var(--border)' }}
              >
                <DragonHeadIcon size={26} />
              </div>
              <div className="leading-none">
                <div style={{ fontFamily: "Impact, 'Bebas Neue', 'Arial Narrow', sans-serif", fontSize: '1.55rem', color: 'var(--gold-lt)', letterSpacing: '0.06em', lineHeight: 1 }}>
                  NINJAGO
                </div>
                <div style={{ fontFamily: "Impact, 'Bebas Neue', 'Arial Narrow', sans-serif", fontSize: '0.78rem', color: 'rgba(232,200,74,0.65)', letterSpacing: '0.38em' }}>
                  BRASIL
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 font-cinzel text-sm font-semibold tracking-wider rounded transition-all ${
                    activeTab(path)
                      ? 'tab-active'
                      : 'tab-inactive hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(s => !s)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(201,162,39,0.4)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-cinzel font-bold"
                      style={{ background: 'var(--gold)', color: 'var(--ninja-brown, #1E0D07)' }}
                    >
                      {(profile?.username || '?')[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block font-lora text-sm" style={{ color: 'var(--gold-lt)' }}>
                      {profile?.username}
                    </span>
                  </button>

                  {userMenu && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl z-40 animate-fade-in"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
                        <p className="font-cinzel text-sm font-semibold" style={{ color: 'var(--red)' }}>{profile?.username}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-lt)' }}>{profile?.ninja_rank}</p>
                      </div>
                      <button
                        onClick={() => { signOut(); setUserMenu(false) }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-lora transition-colors hover:bg-red-50"
                        style={{ color: 'var(--red)' }}
                      >
                        <LogOut size={15} /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="btn-ghost hidden sm:flex" onClick={() => setAuthModal('login')}>
                    <LogIn size={15} /> Entrar
                  </button>
                  <button className="btn-ninja hidden sm:flex" onClick={() => setAuthModal('register')}>
                    <User size={15} /> Cadastrar
                  </button>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded"
                style={{ color: 'rgba(248,235,195,0.8)' }}
                onClick={() => setMenuOpen(s => !s)}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <nav
              className="md:hidden pb-4 pt-1 flex flex-col gap-1 animate-slide-down"
              style={{ borderTop: '1px solid rgba(201,162,39,0.2)' }}
            >
              {NAV.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-2.5 font-cinzel text-sm font-semibold tracking-wider rounded transition-colors ${
                    activeTab(path) ? 'tab-active' : 'tab-inactive'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 mt-2 px-2">
                  <button className="btn-ghost flex-1" onClick={() => { setAuthModal('login'); setMenuOpen(false) }}>Entrar</button>
                  <button className="btn-ninja flex-1" onClick={() => { setAuthModal('register'); setMenuOpen(false) }}>Cadastrar</button>
                </div>
              )}
            </nav>
          )}
        </div>

        {/* Gold bottom line accent */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%)' }} />
      </header>

      {authModal && <AuthModal initialTab={authModal} onClose={() => setAuthModal(null)} />}

      {/* Close user menu on outside click */}
      {userMenu && <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />}
    </>
  )
}
