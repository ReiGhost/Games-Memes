import { useState, useEffect } from 'react'
import { Calendar, Eye, Tag, ChevronLeft, Plus, Loader2, Youtube, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DragonDivider, DragonWatermark } from '../components/ui/DragonDivider'
import { AuthModal } from '../components/auth/AuthModal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

// ── Mock data (shown while Supabase is not yet set up) ──
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Bem-vindo ao NinjagoBrasil!',
    slug: 'bem-vindo',
    excerpt: 'A maior comunidade brasileira de Ninjago chegou. Conheça tudo que preparamos para vocês, ninjas!',
    content: `# Bem-vindo ao NinjagoBrasil!\n\nOlá, ninjas! Sou o **ReiBricks** e é com muito orgulho que apresento o **NinjagoBrasil**.\n\n## O que você encontra aqui\n\n- **Blog**: Notícias, reviews de sets e tutoriais de MOC\n- **Comunidade**: Compartilhe suas criações e coleções\n- **Chat**: Converse em tempo real com outros ninjas\n\n## Canal no YouTube\n\nInscreva-se em [@rei_bricks](https://youtube.com/@rei_bricks) para mais conteúdo!\n\nNinja go! 🥷`,
    cover_image: null,
    tags: ['boas-vindas', 'notícia'],
    published: true,
    views: 128,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    profiles: { username: 'ReiBricks', ninja_rank: 'Lendário' },
  },
  {
    id: '2',
    title: 'Review: LEGO Ninjago Dragons Rising',
    slug: 'review-dragons-rising',
    excerpt: 'A nova fase do Ninjago está incrível! Confira nossa análise completa dos sets da linha Dragons Rising.',
    content: `# Review: LEGO Ninjago Dragons Rising\n\nA nova fase traz dragões incríveis e personagens revamped!\n\n## Destaques\n\n- Novos dragões elementais\n- Personagens redesenhados\n- Sets para todos os bolsos\n\n> "Um dos melhores arcos da história do Ninjago" — ReiBricks`,
    cover_image: null,
    tags: ['review', 'sets', 'dragons-rising'],
    published: true,
    views: 342,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    profiles: { username: 'ReiBricks', ninja_rank: 'Lendário' },
  },
  {
    id: '3',
    title: 'Como fazer um MOC de Ninjago: Guia para iniciantes',
    slug: 'guia-moc-iniciantes',
    excerpt: 'Aprenda a criar suas próprias criações personalizadas de Ninjago com este guia passo a passo.',
    content: `# Como fazer um MOC de Ninjago\n\nMOC (My Own Creation) é quando você cria algo novo com seus blocos!\n\n## Passos básicos\n\n1. **Escolha um tema** — Vila ninja? Templo? Covil?\n2. **Planeje no papel** — Esboce antes de construir\n3. **Separe as peças** — Organize por cor e tipo\n4. **Construa!** — Comece pela base\n\n## Dicas do ReiBricks\n\n- Use SNOT (Studs Not on Top) para detalhes\n- Misture conjuntos para ter mais peças\n- Fotografe o processo`,
    cover_image: null,
    tags: ['tutorial', 'moc', 'iniciante'],
    published: true,
    views: 891,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    profiles: { username: 'ReiBricks', ninja_rank: 'Lendário' },
  },
]

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
function PostCard({ post, onClick }) {
  return (
    <article
      className="card-ninja cursor-pointer"
      onClick={() => onClick(post)}
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

        <h2 className="font-cinzel font-bold text-base mb-2 leading-snug" style={{ color: 'var(--text)' }}>
          {post.title}
        </h2>
        <p className="font-lora text-sm leading-relaxed mb-4" style={{ color: 'var(--text-m)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-cinzel font-bold"
              style={{ background: 'var(--gold)', color: '#1E0D07' }}
            >
              {(post.profiles?.username || 'R')[0]}
            </div>
            <span className="font-cinzel text-xs font-semibold" style={{ color: 'var(--red)' }}>
              {post.profiles?.username || 'ReiBricks'}
            </span>
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
    <div className="max-w-3xl mx-auto animate-fade-in">
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

      <h1 className="font-cinzel font-black text-2xl md:text-3xl mb-4" style={{ color: 'var(--text)', lineHeight: 1.25 }}>
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
  const { isAdmin, user }         = useAuth()
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [creating, setCreating]   = useState(false)
  const [authModal, setAuthModal] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, profiles(username, ninja_rank)')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error || !data?.length) {
      setPosts(MOCK_POSTS)
    } else {
      setPosts(data)
    }
    setLoading(false)
  }

  if (creating) return <main className="max-w-6xl mx-auto px-4 py-8"><CreatePost onDone={() => { setCreating(false); loadPosts() }} /></main>
  if (selected) return <main className="max-w-6xl mx-auto px-4 py-8"><PostDetail post={selected} onBack={() => setSelected(null)} /></main>

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero banner */}
      <section
        className="relative rounded-2xl overflow-hidden mb-10 p-10 text-center"
        style={{ background: 'linear-gradient(135deg, #4A0E0E 0%, #7A1515 50%, #9E2020 100%)', border: '1px solid var(--border)' }}
      >
        <DragonWatermark className="absolute inset-0 w-full h-full opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
            <span className="font-cinzel text-xs tracking-widest font-semibold" style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}>BLOG OFICIAL</span>
            <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
          </div>
          <h1 className="font-cinzel font-black text-3xl md:text-4xl mb-3" style={{ color: 'var(--gold-lt)' }}>
            NinjagoBrasil Blog
          </h1>
          <p className="font-lora text-base mb-5" style={{ color: 'rgba(248,235,195,0.8)' }}>
            Notícias, reviews, tutoriais e muito mais por ReiBricks
          </p>
          <a
            href="https://youtube.com/@rei_bricks?si=nHoaOhxsrtK23Yvq"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ color: 'var(--gold-lt)', borderColor: 'rgba(232,200,74,0.5)' }}
          >
            <Youtube size={16} /> Assistir no YouTube
          </a>
        </div>
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
            <PostCard key={post.id} post={post} onClick={setSelected} />
          ))}
        </div>
      )}

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </main>
  )
}
