import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUp, ArrowDown, ChevronLeft, Send, Loader2, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { UserBadge } from '../components/ui/UserBadge'
import { AuthModal } from '../components/auth/AuthModal'
import { MOCK_COMMUNITY } from '../data/mockData'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const FLAIR_STYLE = {
  'MOC':       { bg: '#1A5A2A', color: '#90EE90' },
  'Compras':   { bg: '#1A3A7A', color: '#90C0FF' },
  'Notícias':  { bg: '#7A1515', color: '#FFAAAA' },
  'Coleção':   { bg: '#5A3A00', color: '#FFD080' },
  'Discussão': { bg: '#3A1A5A', color: '#DDA0FF' },
  'Humor':     { bg: '#5A4A00', color: '#FFEE80' },
  'Geral':     { bg: 'rgba(201,162,39,0.15)', color: '#C9A227' },
}
function flairStyle(f) { return FLAIR_STYLE[f] || FLAIR_STYLE['Geral'] }

const MOCK_COMMENTS = [
  { id: 'c1', content: 'Incrível! Que nível de detalhe!', created_at: new Date(Date.now() - 3600000).toISOString(), profiles: { username: 'NinjaFã', ninja_rank: 'Estudante', role: 'user' } },
  { id: 'c2', content: 'Parabéns, ficou muito bom mesmo!', created_at: new Date(Date.now() - 1800000).toISOString(), profiles: { username: 'ReiBricks', ninja_rank: 'Lendário', role: 'admin' } },
]

export function CommunityPostPage() {
  const { postId }            = useParams()
  const { user, profile, isMod } = useAuth()
  const [post, setPost]       = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const [authModal, setAuthModal] = useState(false)

  useEffect(() => {
    loadPost()
    window.scrollTo(0, 0)
  }, [postId])

  async function loadPost() {
    setLoading(true)
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, profiles(username, ninja_rank, role)')
      .eq('id', postId)
      .single()

    if (error || !data) {
      const mock = MOCK_COMMUNITY.find(p => p.id === postId)
      setPost(mock || null)
      setComments(mock ? MOCK_COMMENTS : [])
    } else {
      setPost(data)
      loadComments(data.id)
    }
    setLoading(false)
  }

  async function loadComments(id) {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, ninja_rank, role)')
      .eq('post_id', id)
      .eq('post_type', 'community')
      .is('parent_id', null)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function sendComment(e) {
    e.preventDefault()
    if (!user) { setAuthModal(true); return }
    if (!newComment.trim()) return
    setSending(true)
    const { error } = await supabase.from('comments').insert({
      content: newComment.trim(),
      author_id: user.id,
      post_id: post.id,
      post_type: 'community',
    })
    setSending(false)
    if (error) { toast.error(error.message); return }
    setNewComment('')
    if (post.id) loadComments(post.id)
    toast.success('Comentário enviado!')
  }

  async function deleteComment(commentId) {
    if (!window.confirm('Deletar comentário?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) { toast.error(error.message); return }
    setComments(prev => prev.filter(c => c.id !== commentId))
    toast.success('Comentário deletado')
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--red)' }} />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-lt)' }}>Post não encontrado.</p>
        <Link to="/comunidade" className="btn-ninja mt-4 inline-flex"><ChevronLeft size={16} /> Voltar</Link>
      </main>
    )
  }

  const fs = flairStyle(post.flair)

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">

        {/* Back */}
        <Link to="/comunidade" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 hover:underline" style={{ color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
          <ChevronLeft size={16} /> Voltar à Comunidade
        </Link>

        {/* Post card */}
        <div className="card-ninja mb-5 overflow-hidden">
          <div className="flex">
            {/* Vote column */}
            <div className="flex flex-col items-center gap-1 py-5 px-3 flex-shrink-0" style={{ background: 'rgba(30,13,7,0.03)', borderRight: '1px solid rgba(201,162,39,0.15)' }}>
              <ArrowUp size={22} style={{ color: 'var(--text-lt)' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--red)' }}>{post.score || 0}</span>
              <ArrowDown size={22} style={{ color: 'var(--text-lt)' }} />
            </div>

            <div className="p-5 flex-1">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flair" style={{ background: fs.bg, color: fs.color, borderColor: fs.color + '55' }}>{post.flair}</span>
                <UserBadge username={post.profiles?.username} role={post.profiles?.role} size="sm" />
                <span className="text-xs" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>
                  · {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
                </span>
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', lineHeight: 1.3, marginBottom: '12px' }}>
                {post.title}
              </h1>

              {/* Content */}
              {post.content && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'var(--text-m)', lineHeight: 1.7 }}>
                  {post.content}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comment form */}
        <form onSubmit={sendComment} className="card-ninja p-4 mb-5">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-m)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}>
            ADICIONAR COMENTÁRIO
          </p>
          <textarea
            className="input-ninja resize-none mb-3"
            rows={3}
            placeholder={user ? 'Compartilhe sua opinião...' : 'Faça login para comentar'}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={!user}
            onClick={() => !user && setAuthModal(true)}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-ninja" disabled={sending || !user}>
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {sending ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>

        {/* Comments list */}
        <div>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>
            <MessageCircle size={15} className="inline mr-1" style={{ color: 'var(--text-lt)' }} />
            {comments.length} Comentário{comments.length !== 1 ? 's' : ''}
          </h3>

          {comments.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>
              Seja o primeiro a comentar!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map(comment => (
                <div key={comment.id} className="card-ninja p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gold)', color: '#1E0D07', fontFamily: 'Inter, sans-serif' }}>
                        {(comment.profiles?.username || '?')[0].toUpperCase()}
                      </div>
                      <UserBadge username={comment.profiles?.username} role={comment.profiles?.role} size="sm" />
                      <span className="text-xs" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>
                        · {formatDistanceToNow(new Date(comment.created_at), { locale: ptBR, addSuffix: true })}
                      </span>
                    </div>
                    {(isMod || user?.id === comment.author_id) && (
                      <button onClick={() => deleteComment(comment.id)} style={{ color: 'var(--red)', opacity: 0.5 }} className="hover:opacity-100 transition-opacity">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'var(--text-m)', lineHeight: 1.6 }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  )
}
