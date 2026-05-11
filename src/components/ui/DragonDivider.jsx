export function DragonDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 my-6 ${className}`}>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #C9A227)' }} />
      <DragonHeadIcon />
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #C9A227)' }} />
    </div>
  )
}

export function DragonHeadIcon({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dragon head - simplified Eastern style */}
      <path
        d="M32 6 C20 6, 10 14, 10 24 C10 30, 13 35, 18 38 L15 50 L24 42 C26 43, 29 44, 32 44 C35 44, 38 43, 40 42 L49 50 L46 38 C51 35, 54 30, 54 24 C54 14, 44 6, 32 6Z"
        fill="#7A1515"
        stroke="#C9A227"
        strokeWidth="1.5"
      />
      {/* Eyes */}
      <ellipse cx="23" cy="22" rx="3.5" ry="4" fill="#C9A227" />
      <ellipse cx="41" cy="22" rx="3.5" ry="4" fill="#C9A227" />
      <circle cx="23" cy="23" r="1.5" fill="#1E0D07" />
      <circle cx="41" cy="23" r="1.5" fill="#1E0D07" />
      {/* Nostrils */}
      <circle cx="28" cy="30" r="1.5" fill="#C9A227" opacity="0.7" />
      <circle cx="36" cy="30" r="1.5" fill="#C9A227" opacity="0.7" />
      {/* Horns */}
      <path d="M20 10 L14 3 L19 8" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M44 10 L50 3 L45 8" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Scales hint */}
      <path d="M22 36 Q32 34 42 36" stroke="#C9A227" strokeWidth="1" opacity="0.5" fill="none" />
    </svg>
  )
}

export function DragonWatermark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Dragon body - sinuous S-curve */}
      <path
        d="M30 250 C60 220, 80 180, 120 170 C160 160, 170 130, 150 100 C130 70, 160 40, 200 30 C240 20, 270 50, 260 80 C250 110, 220 120, 230 150 C240 180, 280 170, 310 190 C340 210, 360 240, 380 260"
        stroke="#7A1515"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.06"
        fill="none"
      />
      <path
        d="M30 250 C60 220, 80 180, 120 170 C160 160, 170 130, 150 100 C130 70, 160 40, 200 30 C240 20, 270 50, 260 80 C250 110, 220 120, 230 150 C240 180, 280 170, 310 190 C340 210, 360 240, 380 260"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.08"
        strokeDasharray="8 4"
        fill="none"
      />
      {/* Dragon head */}
      <ellipse cx="390" cy="265" rx="20" ry="14" fill="#7A1515" opacity="0.07" />
      {/* Dragon tail at start */}
      <path d="M20 255 Q10 240, 5 260 Q0 280, 18 275" fill="#7A1515" opacity="0.06" />
      {/* Scale dots along body */}
      {[
        [120,170], [150,100], [200,30], [260,80], [230,150], [310,190]
      ].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#C9A227" opacity="0.05" />
      ))}
    </svg>
  )
}

export function ShieldBadge({ rank = 'Estudante', className = '' }) {
  const colors = {
    'Estudante':  { bg: '#4A2015', border: '#C9A227', text: '#E8C84A' },
    'Ninja':      { bg: '#7A1515', border: '#C9A227', text: '#E8C84A' },
    'Mestre':     { bg: '#5C3A00', border: '#E8C84A', text: '#FFFAE0' },
    'Lendário':   { bg: '#2A0A5A', border: '#C9A227', text: '#E8C84A' },
  }
  const c = colors[rank] || colors['Estudante']
  return (
    <span
      className={`flair ${className}`}
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      {rank}
    </span>
  )
}
