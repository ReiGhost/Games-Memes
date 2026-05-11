import { useState, useEffect, useCallback } from 'react'
import {
  ArrowUp, ArrowDown, MessageCircle, Plus, Flame, Clock, Award,
  ChevronLeft, Image, AlignLeft, Loader2, Send,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DragonDivider } from '../components/ui/DragonDivider'
import { AuthModal } from '../components/auth/AuthModal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const FLAIRS = ['Todos', 'MOC', 'Compras', 'Notícias', 'Coleção', 'Discussão', 'Humor', 'Geral']

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

const MOCK_COMMUNITY = [
  {
    id: '1', title: 'Meu primeiro MOC de templo ninja!',
    content: 'Finalmente terminei meu templo com 3 andares. Demorou 2 semanas mas ficou incrível! Usei peças do set 71767 e algumas extras.',
    flair: 'MOC', score: 47, comment_count: 12,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    profiles: { username: 'NinjaBuilder99', ninja_rank: 'Ninja' },
    user_vote: 0,
  },
  {
    id: '2', title: 'Review: Set 71794 - Lloyd e Arin valem a pena?',
    content: 'Acabei de montar o 71794 e quero compartilhar minha opinião. O set tem ótimo custo-benefício mas algumas peças poderiam ser melhores...',
    flair: 'Notícias', score: 23, comment_count: 8,
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    profiles: { username: 'LegoBrasil_Fan', ninja_rank: 'Estudante' },
    user_vote: 0,
  },
  {
    id: '3', title: 'Onde comprar sets de Ninjago mais barato no Brasil?',
    content: 'Pesquisei bastante e encontrei algumas lojas online com ótimos preços. Vou listar as melhores aqui para ajudar a comunidade.',
    flair: 'Compras', score: 89, comment_count: 34,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    profiles: { username: 'CaçadorDeOfertas', ninja_rank: 'Mestre' },
    user_vote: 0,
  },
  {
    id: '4', title: 'Minha coleção completa de Ninjago — 5 anos colecionando!',
    content: 'Depois de 5 anos, finalmente consegui todos os sets principais! Aqui está um registro da minha jornada.',
    flair: 'Coleção', score: 156, comment_count: 42,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    profiles: { username: 'NinjaSupremo', ninja_rank: 'Lendário' },
    user_vote: 0,
  },
]

// ── Post card ───────────────────────────────────────────
function CommunityCard({ post, onVote, onClick }) {
  const [score, setScore]     = useState(post.score || 0)
  const [userVote, setUserVote] = useState(post.user_vote || 0)
  const { user }              = useAuth()
  const [authModal, setAuthModal] = useState(false)

  async function handleVote(val, e) {
    e.stopPropagation()
    if (!user) { setAuthModal(true); return }
    const newVote = userVote === val ? 0 : val
    const diff    = newVote - userVote
    setUserVote(newVote)
    setScore(s => s + diff)
    await onVote(post.id, newVote, diff)
  }

  const fs = flairStyle(post.flair)

  return (
    <>
      <article
        className="card-ninja flex gap-0 cursor-pointer"
        onClick={() => onClick(post)}
        style={{ overflow: 'hidden' }}
      >
        {/* Vote column */}
        <div
          className="flex flex-col items-center gap-1 py-4 px-3 flex-shrink-0"
          style={{ background: 'rgba(30,13,7,0.04)', borderRight: '1px solid rgba(201,162,39,0.15)' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className={`p-1 rounded transition-colors ${userVote === 1 ? 'text-orange-500' : 'hover:text-orange-400'}`}
            style={{ color: userVote === 1 ? '#E85A00' : 'var(--text-lt)' }}
            onClick={e => handleVote(1, e)}
          >
            <ArrowUp size={20} />
          </button>
          <span
            className="font-cinzel font-bold text-sm"
            style={{ color: score > 0 ? '#E85A00' : score < 0 ? '#8B1A1A' : 'var(--text-lt)' }}
          >
            {score}
          </span>
          <button
            className="p-1 rounded transition-colors"
            style={{ color: userVote === -1 ? '#8B1A1A' : 'var(--text-lt)' }}
            onClick={e => handleVote(-1, e)}
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flair" style={{ background: fs.bg, color: fs.color, borderColor: fs.color + '55' }}>
              {post.flair}
            </span>
            <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--red)' }}>
              u/{post.profiles?.username}
            </span>
            <span className="font-lora text-xs" style={{ color: 'var(--text-lt)' }}>
              · {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
            </span>
          </div>

          <h2 className="font-cinzel font-bold text-sm md:text-base mb-2" style={{ color: 'var(--text)' }}>
            {post.title}
          </h2>

          {post.content && (
            <p
              className="font-lora text-sm mb-3"
              style={{
                color: 'var(--text-m)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.content}
            </p>
          )}

          <div className="flex items-center gap-4" style={{ color: 'var(--text-lt)' }}>
            <span className="flex items-center gap-1 text-xs font-lora">
              <MessageCircle size={13} /> {post.comment_count} comentário{post.comment_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </article>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  )
}

// ── Post detail with comments ────────────────────────────
function PostDetail({ post: initialPost, onBack }) {
  const [post, setPost]       = useState(initialPost)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { user, profile }     = useAuth()
  const [authModal, setAuthModal] = useState(false)

  useEffect(() => {
    loadComments()
  }, [post.id])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, ninja_rank)')
      .eq('post_id', post.id)
      .eq('post_type', 'community')
      .is('parent_id', null)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoading(false)
  }

  async function sendComment(e) {
    e.preventDefault()
    if (!user) { setAuthModal(true); return }
    if (!newComment.trim()) return
    setSending(true)
    const { error } = await supabase.from('comments').insert({
      content: newComment,
      author_id: user.id,
      post_id: post.id,
      post_type: 'community',
    })
    setSending(false)
    if (error) { toast.error(error.message); return }
    setNewComment('')
    loadComments()
    toast.success('Comentário enviado!')
  }

  const fs = flairStyle(post.flair)

  return (
    <>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 font-cinzel text-sm font-semibold" style={{ color: 'var(--red)' }}>
          <ChevronLeft size={18} /> Voltar à Comunidade
        </button>

        {/* Post */}
        <div className="card-ninja mb-6" style={{ overflow: 'hidden' }}>
          <div className="flex gap-0">
            <div className="flex flex-col items-center gap-1 py-6 px-4" style={{ background: 'rgba(30,13,7,0.04)', borderRight: '1px solid rgba(201,162,39,0.15)' }}>
              <ArrowUp size={22} style={{ color: 'var(--text-lt)' }} />
              <span className="font-cinzel font-bold" style={{ color: 'var(--red)' }}>{post.score}</span>
              <ArrowDown size={22} style={{ color: 'var(--text-lt)' }} />
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="flair" style={{ background: fs.bg, color: fs.color, borderColor: fs.color + '55' }}>{post.flair}</span>
                <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--red)' }}>u/{post.profiles?.username}</span>
                <span className="font-lora text-xs" style={{ color: 'var(--text-lt)' }}>
                  · {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
                </span>
              </div>
              <h1 className="font-cinzel font-black text-xl mb-4" style={{ color: 'var(--text)' }}>{post.title}</h1>
              {post.content && (
                <p className="font-lora leading-relaxed" style={{ color: 'var(--text-m)' }}>{post.content}</p>
              )}
            </div>
          </div>
        </div>

        {/* Comment form */}
        <form onSubmit={sendComment} className="card-ninja p-4 mb-6">
          <p className="font-cinzel text-xs font-semibold mb-3" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>
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

        {/* Comments */}
        <div>
          <h3 className="font-cinzel font-bold mb-4" style={{ color: 'var(--text)' }}>
            {comments.length} Comentário{comments.length !== 1 ? 's' : ''}
          </h3>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="font-lora text-sm text-center py-8" style={{ color: 'var(--text-lt)' }}>
              Seja o primeiro a comentar!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map(comment => (
                <div key={comment.id} className="card-ninja p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-cinzel font-bold" style={{ background: 'var(--gold)', color: '#1E0D07' }}>
                      {(comment.profiles?.username || '?')[0].toUpperCase()}
                    </div>
                    <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--red)' }}>
                      {comment.profiles?.username}
                    </span>
                    <span className="font-lora text-xs" style={{ color: 'var(--text-lt)' }}>
                      · {formatDistanceToNow(new Date(comment.created_at), { locale: ptBR, addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-lora text-sm leading-relaxed" style={{ color: 'var(--text-m)' }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  )
}

// ── Create post form ────────────────────────────────────
function CreatePost({ onDone }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', content: '', flair: 'Geral' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('community_posts').insert({
      title: form.title,
      content: form.content,
      flair: form.flair,
      author_id: user.id,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Post criado!')
    onDone()
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 mb-6 font-cinzel text-sm font-semibold" style={{ color: 'var(--red)' }}>
        <ChevronLeft size={18} /> Cancelar
      </button>
      <h2 className="font-cinzel font-black text-2xl mb-6" style={{ color: 'var(--text)' }}>Criar Post</h2>
      <form onSubmit={submit} className="card-ninja p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>FLAIR</span>
          <select className="input-ninja" value={form.flair} onChange={set('flair')}>
            {FLAIRS.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>TÍTULO</span>
          <input className="input-ninja" value={form.title} onChange={set('title')} required placeholder="Título do post" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>CONTEÚDO</span>
          <textarea className="input-ninja resize-y" rows={5} value={form.content} onChange={set('content')} placeholder="Conte sua história, mostre sua coleção..." />
        </label>
        <button type="submit" className="btn-ninja justify-center mt-2" disabled={loading}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Criando...</> : 'Publicar Post'}
        </button>
      </form>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────
export function CommunityPage() {
  const { user }                  = useAuth()
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [sort, setSort]           = useState('hot')
  const [flair, setFlair]         = useState('Todos')
  const [selected, setSelected]   = useState(null)
  const [creating, setCreating]   = useState(false)
  const [authModal, setAuthModal] = useState(false)

  useEffect(() => { loadPosts() }, [sort, flair])

  async function loadPosts() {
    setLoading(true)
    let query = supabase
      .from('community_posts')
      .select('*, profiles(username, ninja_rank)')

    if (flair !== 'Todos') query = query.eq('flair', flair)

    if (sort === 'hot') query = query.order('score', { ascending: false })
    else if (sort === 'new') query = query.order('created_at', { ascending: false })
    else query = query.order('comment_count', { ascending: false })

    const { data, error } = await query.limit(50)

    if (error || !data?.length) setPosts(MOCK_COMMUNITY)
    else setPosts(data)
    setLoading(false)
  }

  async function handleVote(postId, newVote, diff) {
    if (!user) return
    if (newVote === 0) {
      await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('votes').upsert({ post_id: postId, user_id: user.id, value: newVote })
    }
    await supabase.from('community_posts').update({ score: supabase.rpc('increment', { x: diff }) }).eq('id', postId)
  }

  if (creating) return <main className="max-w-6xl mx-auto px-4 py-8"><CreatePost onDone={() => { setCreating(false); loadPosts() }} /></main>
  if (selected) return <main className="max-w-6xl mx-auto px-4 py-8"><PostDetail post={selected} onBack={() => setSelected(null)} /></main>

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--surface)', border: '1px solid rgba(201,162,39,0.3)' }}>
              {[
                { key: 'hot',  icon: <Flame size={14} />,  label: 'Em Alta' },
                { key: 'new',  icon: <Clock size={14} />,  label: 'Novos'   },
                { key: 'top',  icon: <Award size={14} />,  label: 'Top'     },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-cinzel text-xs font-semibold transition-all"
                  style={{
                    background: sort === key ? 'var(--red)' : 'transparent',
                    color: sort === key ? 'var(--gold-lt)' : 'var(--text-lt)',
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <button
              className="btn-ninja"
              onClick={() => user ? setCreating(true) : setAuthModal(true)}
            >
              <Plus size={15} /> Criar Post
            </button>
          </div>

          {/* Flair filter */}
          <div className="flex flex-wrap gap-2 mb-5">
            {FLAIRS.map(f => (
              <button
                key={f}
                onClick={() => setFlair(f)}
                className="flair cursor-pointer transition-all"
                style={
                  flair === f
                    ? { background: 'var(--red)', color: 'var(--gold-lt)', borderColor: 'var(--gold)' }
                    : { background: 'transparent', color: 'var(--text-lt)', borderColor: 'rgba(201,162,39,0.3)' }
                }
              >
                {f}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="card-ninja flex overflow-hidden">
                  <div className="skeleton w-14" style={{ minHeight: '100px' }} />
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="skeleton h-4 w-1/4" />
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="card-ninja p-12 text-center">
              <p className="font-cinzel text-lg font-bold mb-2" style={{ color: 'var(--text-m)' }}>Nenhum post encontrado</p>
              <p className="font-lora text-sm" style={{ color: 'var(--text-lt)' }}>Seja o primeiro a postar!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map(post => (
                <CommunityCard key={post.id} post={post} onVote={handleVote} onClick={setSelected} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="card-ninja p-5 mb-4">
            <div
              className="h-16 rounded-lg mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4A0E0E, #7A1515)' }}
            >
              <span className="font-cinzel font-black text-lg" style={{ color: 'var(--gold-lt)' }}>Comunidade</span>
            </div>
            <p className="font-lora text-sm leading-relaxed mb-4" style={{ color: 'var(--text-m)' }}>
              O espaço dos ninjas brasileiros! Compartilhe MOCs, coleções, dicas e muito mais.
            </p>
            <DragonDivider />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-lora text-sm">
                <span style={{ color: 'var(--text-lt)' }}>Membros</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>1.247</span>
              </div>
              <div className="flex justify-between font-lora text-sm">
                <span style={{ color: 'var(--text-lt)' }}>Online agora</span>
                <span className="font-semibold" style={{ color: '#2A8A2A' }}>● 42</span>
              </div>
            </div>
            <button
              className="btn-ninja w-full justify-center mt-4"
              onClick={() => user ? setCreating(true) : setAuthModal(true)}
            >
              <Plus size={15} /> Criar Post
            </button>
          </div>

          <div className="card-ninja p-5">
            <h3 className="font-cinzel font-bold text-sm mb-3" style={{ color: 'var(--text)', letterSpacing: '0.06em' }}>REGRAS</h3>
            <ol className="font-lora text-xs flex flex-col gap-2" style={{ color: 'var(--text-m)' }}>
              {[
                'Seja respeitoso',
                'Sem spam ou autopromoção excessiva',
                'Use as flairs corretamente',
                'Sem conteúdo pirata ou ilegal',
                'Conteúdo em português preferencial',
              ].map((rule, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-cinzel font-bold" style={{ color: 'var(--red)' }}>{i + 1}.</span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </main>
  )
}
