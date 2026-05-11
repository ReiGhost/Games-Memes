import { Youtube, Heart } from 'lucide-react'
import { DragonDivider, DragonHeadIcon } from '../ui/DragonDivider'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(180deg, #5C0E0E 0%, #3A0808 100%)', borderTop: '2px solid var(--border)' }}>
      {/* Gold top accent */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%)' }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DragonHeadIcon size={36} />
              <div>
                <div className="font-cinzel font-black text-2xl" style={{ color: 'var(--gold-lt)' }}>NinjagoBrasil</div>
                <div className="font-cinzel text-xs tracking-widest" style={{ color: 'rgba(232,200,74,0.55)', letterSpacing: '0.2em' }}>A DOJÔ DIGITAL</div>
              </div>
            </div>
            <p className="font-lora text-sm leading-relaxed" style={{ color: 'rgba(248,235,195,0.65)' }}>
              A maior comunidade brasileira de fãs de Ninjago. Blog, comunidade e chat em um só lugar.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-cinzel font-bold text-sm tracking-widest mb-4" style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}>
              NAVEGAÇÃO
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Blog',       to: '/' },
                { label: 'Comunidade', to: '/comunidade' },
                { label: 'Chat',       to: '/chat' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-lora text-sm transition-colors hover:text-yellow-300"
                    style={{ color: 'rgba(248,235,195,0.65)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creator */}
          <div>
            <h3 className="font-cinzel font-bold text-sm tracking-widest mb-4" style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}>
              CRIADOR
            </h3>
            <a
              href="https://youtube.com/@rei_bricks?si=nHoaOhxsrtK23Yvq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,162,39,0.3)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--red), #C0392B)' }}
              >
                <Youtube size={20} style={{ color: 'white' }} />
              </div>
              <div>
                <p className="font-cinzel font-bold text-sm" style={{ color: 'var(--gold-lt)' }}>ReiBricks</p>
                <p className="font-lora text-xs" style={{ color: 'rgba(248,235,195,0.55)' }}>@rei_bricks • YouTube</p>
              </div>
            </a>
            <p className="font-lora text-xs mt-3 leading-relaxed" style={{ color: 'rgba(248,235,195,0.45)' }}>
              Criador de conteúdo de LEGO Ninjago — reviews, MOCs e muito mais!
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(201,162,39,0.2)' }}
        >
          <p className="font-lora text-xs" style={{ color: 'rgba(248,235,195,0.4)' }}>
            © {new Date().getFullYear()} NinjagoBrasil — Todos os direitos reservados
          </p>
          <p className="flex items-center gap-1.5 font-lora text-xs" style={{ color: 'rgba(248,235,195,0.4)' }}>
            Feito com <Heart size={12} style={{ color: 'var(--red-mid)' }} fill="currentColor" /> por ReiBricks
          </p>
        </div>
      </div>
    </footer>
  )
}
