import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, Hash, Users, Smile } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AuthModal } from '../components/auth/AuthModal'
import { DragonWatermark } from '../components/ui/DragonDivider'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const ROOMS = [
  { id: 'geral',     label: 'Geral',     description: 'Conversa geral sobre Ninjago' },
  { id: 'moc',       label: 'MOC',       description: 'Compartilhe e discuta MOCs' },
  { id: 'compras',   label: 'Compras',   description: 'Dicas de onde comprar' },
  { id: 'offtopic',  label: 'Off-topic', description: 'Qualquer assunto' },
]

const MOCK_MESSAGES = [
  { id: '1', content: 'Olá pessoal! Bem-vindos ao chat do NinjagoBrasil! 🐉', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), profiles: { username: 'ReiBricks', ninja_rank: 'Lendário' }, author_id: 'admin' },
  { id: '2', content: 'Acabei de terminar meu MOC de templo! Alguém quer ver?', created_at: new Date(Date.now() - 3600000).toISOString(), profiles: { username: 'NinjaBuilder99', ninja_rank: 'Ninja' }, author_id: 'user1' },
  { id: '3', content: 'Sim! Manda as fotos aqui!', created_at: new Date(Date.now() - 1800000).toISOString(), profiles: { username: 'LegoBrasil_Fan', ninja_rank: 'Estudante' }, author_id: 'user2' },
  { id: '4', content: 'Alguém viu o novo trailer da próxima temporada?', created_at: new Date(Date.now() - 900000).toISOString(), profiles: { username: 'NinjaSupremo', ninja_rank: 'Mestre' }, author_id: 'user3' },
  { id: '5', content: 'Sim! Ficou incrível! Os dragões desse arco estão demais! 🔥', created_at: new Date(Date.now() - 600000).toISOString(), profiles: { username: 'CaçadorDeOfertas', ninja_rank: 'Ninja' }, author_id: 'user4' },
]

function formatMsgTime(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return `ontem ${format(d, 'HH:mm')}`
  return format(d, 'dd/MM HH:mm')
}

const RANK_COLORS = {
  'Lendário':  '#FFD700',
  'Mestre':    '#FFA500',
  'Ninja':     '#C9A227',
  'Estudante': '#8B5A3C',
}

function Message({ msg, isMine }) {
  const rankColor = RANK_COLORS[msg.profiles?.ninja_rank] || '#8B5A3C'

  return (
    <div className={`flex gap-3 px-4 py-2 group hover:bg-black/5 transition-colors ${isMine ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-cinzel font-bold flex-shrink-0 mt-0.5"
        style={{ background: isMine ? '#7A1515' : 'var(--surface-2)', border: `1.5px solid ${rankColor}`, color: rankColor }}
      >
        {(msg.profiles?.username || '?')[0].toUpperCase()}
      </div>

      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          <span className="font-cinzel text-xs font-semibold" style={{ color: rankColor }}>
            {msg.profiles?.username || 'Usuário'}
          </span>
          <span className="font-cinzel text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-lt)' }}>
            {formatMsgTime(msg.created_at)}
          </span>
        </div>

        <div
          className="font-lora text-sm leading-relaxed px-3 py-2 rounded-xl"
          style={{
            background: isMine
              ? 'linear-gradient(135deg, #5C0E0E, #7A1515)'
              : 'var(--surface)',
            color: isMine ? 'rgba(248,235,195,0.9)' : 'var(--text)',
            border: isMine
              ? '1px solid rgba(201,162,39,0.3)'
              : '1px solid rgba(201,162,39,0.2)',
            borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}

export function ChatPage() {
  const { user, profile }         = useAuth()
  const [room, setRoom]           = useState('geral')
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [authModal, setAuthModal] = useState(false)
  const [onlineCount]             = useState(Math.floor(Math.random() * 30) + 8)
  const endRef                    = useRef(null)
  const inputRef                  = useRef(null)

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel(`chat:${room}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room=eq.${room}` },
        async (payload) => {
          const { data } = await supabase
            .from('profiles')
            .select('username, ninja_rank')
            .eq('id', payload.new.author_id)
            .single()
          setMessages(prev => [...prev, { ...payload.new, profiles: data }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room])

  useEffect(() => { scrollToBottom() }, [messages])

  async function loadMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profiles(username, ninja_rank)')
      .eq('room', room)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error || !data?.length) setMessages(MOCK_MESSAGES)
    else setMessages(data)
    setLoading(false)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!user) { setAuthModal(true); return }
    if (!input.trim()) return
    setSending(true)
    const content = input.trim()
    setInput('')

    const { error } = await supabase.from('chat_messages').insert({
      content,
      author_id: user.id,
      room,
    })
    setSending(false)
    if (error) {
      toast.error('Erro ao enviar mensagem')
      setInput(content)
    }
    inputRef.current?.focus()
  }

  const currentRoom = ROOMS.find(r => r.id === room)

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(201,162,39,0.35)',
            boxShadow: '0 4px 24px rgba(30,13,7,0.1)',
            height: 'calc(100vh - 180px)',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5C0E0E, #7A1515)', borderBottom: '1px solid rgba(201,162,39,0.3)' }}
          >
            <div className="flex items-center gap-2">
              <Hash size={18} style={{ color: 'var(--gold)' }} />
              <span className="font-cinzel font-bold text-sm" style={{ color: 'var(--gold-lt)' }}>
                {currentRoom?.label}
              </span>
              <span className="font-lora text-xs hidden md:block" style={{ color: 'rgba(248,235,195,0.55)' }}>
                — {currentRoom?.description}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-lora text-xs" style={{ color: 'rgba(248,235,195,0.6)' }}>
                {onlineCount} online
              </span>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Rooms sidebar */}
            <aside
              className="w-48 flex-shrink-0 hidden sm:flex flex-col py-3"
              style={{ background: 'var(--surface-2)', borderRight: '1px solid rgba(201,162,39,0.2)' }}
            >
              <p className="font-cinzel text-xs font-bold px-3 mb-2" style={{ color: 'var(--text-lt)', letterSpacing: '0.1em' }}>
                SALAS
              </p>
              {ROOMS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoom(r.id)}
                  className="flex items-center gap-2 px-3 py-2 mx-1 rounded-md text-sm font-lora transition-colors text-left"
                  style={{
                    background: room === r.id ? 'rgba(122,21,21,0.15)' : 'transparent',
                    color: room === r.id ? 'var(--red)' : 'var(--text-lt)',
                    fontWeight: room === r.id ? 600 : 400,
                  }}
                >
                  <Hash size={14} />
                  {r.label}
                </button>
              ))}

              {/* Online users hint */}
              <div className="mt-auto px-3 py-2" style={{ borderTop: '1px solid rgba(201,162,39,0.2)' }}>
                <p className="font-cinzel text-xs font-bold mb-1" style={{ color: 'var(--text-lt)', letterSpacing: '0.1em' }}>
                  ONLINE
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="font-lora text-xs" style={{ color: 'var(--text-lt)' }}>{onlineCount} ninjas</span>
                </div>
              </div>
            </aside>

            {/* Messages area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              {/* Room tabs (mobile) */}
              <div className="flex sm:hidden gap-1 px-3 py-2 overflow-x-auto flex-shrink-0" style={{ borderBottom: '1px solid rgba(201,162,39,0.2)', background: 'var(--surface-2)' }}>
                {ROOMS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRoom(r.id)}
                    className="flex-shrink-0 px-3 py-1 rounded-full font-cinzel text-xs transition-colors"
                    style={{
                      background: room === r.id ? 'var(--red)' : 'transparent',
                      color: room === r.id ? 'var(--gold-lt)' : 'var(--text-lt)',
                      border: '1px solid',
                      borderColor: room === r.id ? 'var(--gold)' : 'rgba(201,162,39,0.25)',
                    }}
                  >
                    #{r.label}
                  </button>
                ))}
              </div>

              {/* Messages scroll */}
              <div className="flex-1 overflow-y-auto py-2 relative" style={{ background: 'var(--bg)' }}>
                {/* Watermark */}
                <DragonWatermark className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />

                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--red)' }} />
                  </div>
                ) : (
                  <>
                    {/* Date header */}
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.2)' }} />
                      <span className="font-cinzel text-xs" style={{ color: 'var(--text-lt)' }}>Hoje</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.2)' }} />
                    </div>

                    {messages.map(msg => (
                      <Message
                        key={msg.id}
                        msg={msg}
                        isMine={user && msg.author_id === user.id}
                      />
                    ))}
                    <div ref={endRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(201,162,39,0.2)', background: 'var(--surface)' }}>
                {!user ? (
                  <button
                    onClick={() => setAuthModal(true)}
                    className="w-full py-2.5 rounded-lg font-cinzel text-sm font-semibold transition-colors"
                    style={{ background: 'rgba(122,21,21,0.1)', border: '1px solid rgba(122,21,21,0.3)', color: 'var(--red)' }}
                  >
                    Faça login para participar do chat →
                  </button>
                ) : (
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      ref={inputRef}
                      className="input-ninja flex-1"
                      placeholder={`Mensagem em #${currentRoom?.label}...`}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      disabled={sending}
                      maxLength={500}
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      className="btn-ninja flex-shrink-0"
                      disabled={sending || !input.trim()}
                    >
                      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  )
}
