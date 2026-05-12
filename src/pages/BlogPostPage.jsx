import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Eye, Tag, ChevronLeft, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DragonDivider, DragonWatermark } from '../components/ui/DragonDivider'
import { UserBadge } from '../components/ui/UserBadge'
import { MOCK_POSTS } from '../data/mockData'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TAG_COLORS = {
  'notícia':     { bg: '#7A1515', color: '#E8C84A' },
  'review':      { bg: '#1A5A2A', color: '#90EE90' },
  'tutorial':    { bg: '#1A3A7A', color: '#90C0FF' },
  'moc':         { bg: '#5A3A00', color: '#FFD080' },
  'boas-vindas': { bg: '#4A1A4A', color: '#E090E0' },
  'sets':        { bg: '#2A4A1A', color: '#A0D070' },
}
function tagStyle(tag) { return TAG_COLORS[tag] || { bg: 'rgba(201,162,39,0.15)', color: '#C9A227' } }

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
    .replace(/\n/g,   '<br/>')
  return `<p>${html}</p>`
}

export function BlogPostPage() {
  const { slug }        = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPost()
    window.scrollTo(0, 0)
  }, [slug])

  async function loadPost() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, profiles(username, ninja_rank, role)')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      const mock = MOCK_POSTS.find(p => p.slug === slug)
      setPost(mock || null)
    } else {
      setPost(data)
      // increment view count silently
      supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
    }
    setLoading(false)
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
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-lt)', fontSize: '1.1rem' }}>
          Post não encontrado.
        </p>
        <Link to="/" className="btn-ninja mt-4 inline-flex">
          <ChevronLeft size={16} /> Voltar ao Blog
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-fade-in" style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(201,162,39,0.2)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(30,13,7,0.08)' }}>

        {/* Cover hero */}
        <div className="relative h-52 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2E0707, #6B1414, #8B1A1A)' }}>
          <DragonWatermark className="absolute inset-0 w-full h-full opacity-50" />
        </div>

        <div className="p-6 md:p-8">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 hover:underline" style={{ color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
            <ChevronLeft size={16} /> Voltar ao Blog
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags?.map(tag => (
              <span key={tag} className="flair" style={{ background: tagStyle(tag).bg, color: tagStyle(tag).color, borderColor: tagStyle(tag).color + '55' }}>
                <Tag size={9} className="inline mr-1" />{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text)', lineHeight: 1.2, marginBottom: '1rem' }}>
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 pb-6 mb-6" style={{ borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--gold)', color: '#1E0D07', fontFamily: 'Inter, sans-serif' }}>
                {(post.profiles?.username || 'R')[0].toUpperCase()}
              </div>
              <div>
                <UserBadge username={post.profiles?.username || 'ReiBricks'} role={post.profiles?.role || 'admin'} size="sm" />
                <p className="text-xs" style={{ color: 'var(--text-lt)', fontFamily: 'Inter, sans-serif' }}>{post.profiles?.ninja_rank}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto" style={{ color: 'var(--text-lt)' }}>
              <span className="flex items-center gap-1 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Eye size={13} /> {post.views || 0}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Calendar size={13} />
                {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="prose-ninja" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

          <DragonDivider className="mt-10" />
        </div>
      </div>
    </main>
  )
}
