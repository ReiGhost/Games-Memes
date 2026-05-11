import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { BlogPage }      from './pages/BlogPage'
import { CommunityPage } from './pages/CommunityPage'
import { ChatPage }      from './pages/ChatPage'
import { useAuth }       from './contexts/AuthContext'
import { Loader2 }       from 'lucide-react'

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center flex-col gap-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #5C0E0E, #7A1515)', border: '2px solid var(--border)' }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--gold)' }} />
      </div>
      <p className="font-cinzel text-sm font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.15em' }}>
        CARREGANDO...
      </p>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <div className="dragon-scales-bg min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        <Routes>
          <Route path="/"           element={<BlogPage />} />
          <Route path="/comunidade" element={<CommunityPage />} />
          <Route path="/chat"       element={<ChatPage />} />
          <Route path="*"           element={<BlogPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
