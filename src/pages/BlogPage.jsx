import { useState, useEffect } from 'react'
import { Calendar, Eye, Tag, Plus, Loader2, Youtube, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DragonDivider, DragonWatermark } from '../components/ui/DragonDivider'
import { UserBadge } from '../components/ui/UserBadge'
import { AuthModal } from '../components/auth/AuthModal'
import { MOCK_POSTS } from '../data/mockData'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

// ── Flair color map ─────────────────────────────────────
const TAG_COLORS = {
  'notícia':        { bg: '#7A1515', color: '#E8C84A' },
  'review':         { bg: '#1A5A2A', color: '#90EE90' },
  'tutorial':       { bg: '#1A3A7A', color: '#90C0FF' },
  'moc':            { bg: '#5A3A00', color: '#FFD080' },
  'boas-vindas':    { bg: '#4A1A4A', color: '#E090E0' },
  'sets':           { bg: '#2A4A1A', color: '#A0D070' },
}
function tagStyle(tag) {
  return TAG_COLORS[tag] || { bg: 'rgba(201,162,39,0.15)', color: '#C9A227' }
}

// ── Render simple markdown ──────────────────────────────
function renderMarkdown(md) {
  if (!md) return ''
  let html = md
    .replace(/^### (.+)/gm, '<h3>$1</h3>')
    .replace(/^## (.+)/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^> (.+)/gm,   '<blockquote>$1</blockquote>')
    .replace(/^- (.+)/gm,   '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
  return `<p>${html}</p>`
}

// ── Post card ───────────────────────────────────────────
function PostCard({ post }) {
  const navigate = useNavigate()
  return (
    <article
      className="card-ninja cursor-pointer"
      onClick={() => navigate(`/blog/${post.slug}`)}
      style={{ overflow: 'hidden' }}
    >
      {/* Cover image placeholder */}
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5C0E0E 0%, #7A1515 60%, #9E2020 100%)' }}
      >
        <DragonWatermark className="absolute inset-0 w-full h-full opacity-60" />
        <BookOpen size={40} style={{ color: 'rgba(201,162,39,0.5)', position: 'relative', zIndex: 1 }} />
      </div>

      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags?.slice(0,3).map(tag => (
            <span
              key={tag}
              className="flair"
              style={{ background: tagStyle(tag).bg, color: tagStyle(tag).color, borderColor: tagStyle(tag).color + '55' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-base mb-2 leading-snug" style={{ color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          {post.title}
        </h2>
        <p className="font-lora text-sm leading-relaxed mb-4" style={{ color: 'var(--text-m)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gold)', color: '#1E0D07', fontFamily: 'Inter, sans-serif' }}>
              {(post.profiles?.username || 'R')[0]}
            </div>
            <UserBadge username={post.profiles?.username || 'ReiBricks'} role={post.profiles?.role || 'admin'} size="sm" />
          </div>
          <div className="flex items-center gap-3" style={{ color: 'var(--text-lt)' }}>
            <span className="flex items-center gap-1 text-xs font-lora">
              <Eye size={12} /> {post.views || 0}
            </span>
            <span className="flex items-center gap-1 text-xs font-lora">
              <Calendar size={12} />
              {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Post detail view ────────────────────────────────────
function PostDetail({ post, onBack }) {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in" style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(201,162,39,0.2)', padding: '2rem', boxShadow: '0 2px 16px rgba(30,13,7,0.07)' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 font-cinzel text-sm font-semibold transition-colors hover:underline"
        style={{ color: 'var(--red)' }}
      >
        <ChevronLeft size={18} /> Voltar ao Blog
      </button>

      {/* Hero */}
      <div
        className="rounded-xl overflow-hidden mb-8 h-56 flex items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #5C0E0E, #7A1515, #9E2020)' }}
      >
        <DragonWatermark className="absolute inset-0 w-full h-full" />
        <BookOpen size={64} style={{ color: 'rgba(201,162,39,0.35)', position: 'relative', zIndex: 1 }} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags?.map(tag => (
          <span key={tag} className="flair" style={{ background: tagStyle(tag).bg, color: tagStyle(tag).color, borderColor: tagStyle(tag).color + '55' }}>
            <Tag size={10} className="inline mr-1" />{tag}
          </span>
        ))}
      </div>

      <h1 className="text-2xl md:text-3xl mb-4" style={{ color: 'var(--text)', lineHeight: 1.25, fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
        {post.title}
      </h1>

      <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(201,162,39,0.25)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-cinzel font-bold text-sm" style={{ background: 'var(--gold)', color: '#1E0D07' }}>
            {(post.profiles?.username || 'R')[0]}
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold" style={{ color: 'var(--red)' }}>{post.profiles?.username || 'ReiBricks'}</p>
            <p className="font-lora text-xs" style={{ color: 'var(--text-lt)' }}>{post.profiles?.ninja_rank}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto" style={{ color: 'var(--text-lt)' }}>
          <span className="flex items-center gap-1 text-xs font-lora"><Eye size={13} /> {post.views}</span>
          <span className="flex items-center gap-1 text-xs font-lora">
            <Calendar size={13} />
            {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="prose-ninja"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      <DragonDivider className="mt-12" />
    </div>
  )
}

// ── Create post form (admin only) ───────────────────────
function CreatePost({ onDone }) {
  const { user } = useAuth()
  const [form, setForm]     = useState({ title: '', excerpt: '', content: '', tags: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error } = await supabase.from('blog_posts').insert({
      title: form.title,
      slug,
      excerpt: form.excerpt,
      content: form.content,
      tags,
      published: true,
      author_id: user.id,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Post publicado!')
    onDone()
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onDone} className="flex items-center gap-2 mb-6 font-cinzel text-sm font-semibold" style={{ color: 'var(--red)' }}>
        <ChevronLeft size={18} /> Cancelar
      </button>
      <h2 className="font-cinzel font-black text-2xl mb-6" style={{ color: 'var(--text)' }}>Novo Post</h2>
      <form onSubmit={submit} className="card-ninja p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>TÍTULO</span>
          <input className="input-ninja" value={form.title} onChange={set('title')} required placeholder="Título do post" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>RESUMO</span>
          <textarea className="input-ninja resize-none" rows={2} value={form.excerpt} onChange={set('excerpt')} placeholder="Breve descrição..." />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>CONTEÚDO (Markdown)</span>
          <textarea className="input-ninja resize-y font-mono text-sm" rows={12} value={form.content} onChange={set('content')} required placeholder="# Título&#10;&#10;Seu conteúdo em Markdown..." />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--text-m)', letterSpacing: '0.06em' }}>TAGS (separadas por vírgula)</span>
          <input className="input-ninja" value={form.tags} onChange={set('tags')} placeholder="notícia, review, tutorial" />
        </label>
        <button type="submit" className="btn-ninja justify-center mt-2" disabled={loading}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Publicando...</> : 'Publicar Post'}
        </button>
      </form>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────
export function BlogPage() {
  const { isAdmin }           = useAuth()
  const navigate              = useNavigate()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, profiles(username, ninja_rank, role)')
      .eq('published', true)
      .order('created_at', { ascending: false })

    setPosts(error || !data?.length ? MOCK_POSTS : data)
    setLoading(false)
  }

  if (creating) return <main className="max-w-6xl mx-auto px-4 py-8"><CreatePost onDone={() => { setCreating(false); loadPosts() }} /></main>

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero banner */}
      <section
        className="relative rounded-2xl overflow-hidden mb-10"
        style={{ background: 'linear-gradient(135deg, #2E0707 0%, #5C1010 50%, #8B1A1A 100%)', border: '1px solid rgba(201,162,39,0.45)' }}
      >
        {/* Top gold line */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent 0%, #C9A227 50%, transparent 100%)' }} />

        <div className="relative flex flex-col md:flex-row items-center gap-0">
          {/* Left: text */}
          <div className="flex-1 px-8 py-10">
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.3em', color: 'rgba(201,162,39,0.75)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Por ReiBricks
            </p>
            <h1 style={{ fontFamily: "'Russo One', 'Arial Black', sans-serif", fontSize: '2.8rem', color: '#F5DFA0', lineHeight: 0.95, letterSpacing: '0.01em', marginBottom: '16px' }}>
              NINJAGO<br />
              <span style={{ color: 'rgba(245,223,160,0.55)', fontSize: '1.8rem', letterSpacing: '0.18em' }}>BRASIL</span>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(248,235,195,0.65)', marginBottom: '28px', lineHeight: 1.6 }}>
              Notícias, reviews, tutoriais<br />e muito mais sobre Ninjago
            </p>
            <a
              href="https://youtube.com/@rei_bricks?si=nHoaOhxsrtK23Yvq"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px',
                background: 'rgba(201,162,39,0.15)',
                border: '1px solid rgba(201,162,39,0.5)',
                borderRadius: '8px',
                color: 'var(--gold-lt)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <Youtube size={16} /> Assistir no YouTube
            </a>
          </div>

          {/* Right: decorative block */}
          <div
            className="hidden md:flex items-center justify-center w-64 self-stretch"
            style={{ background: 'rgba(0,0,0,0.2)', borderLeft: '1px solid rgba(201,162,39,0.15)' }}
          >
            <DragonWatermark className="w-full h-full opacity-60" />
          </div>
        </div>

        {/* Bottom gold line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #C9A227 50%, transparent 100%)' }} />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cinzel font-bold text-xl" style={{ color: 'var(--text)' }}>
          Últimas Publicações
        </h2>
        {isAdmin && (
          <button className="btn-ninja" onClick={() => setCreating(true)}>
            <Plus size={15} /> Novo Post
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="card-ninja overflow-hidden">
              <div className="skeleton h-44" />
              <div className="p-5 flex flex-col gap-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </main>
  )
}
