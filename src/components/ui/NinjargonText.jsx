// Simplified Ninjargon (Ninjago language) glyph paths — 20×28 viewbox per character
const GLYPHS = {
  A: 'M3,25 L17,3 M3,3 L17,25',
  B: 'M3,3 L17,3 M10,3 L10,25 M10,17 C17,17 17,25 10,25',
  C: 'M16,3 C3,3 3,14 3,14 C3,25 16,25 16,25',
  D: 'M17,3 L3,3 L17,14 L3,25',
  E: 'M3,3 L3,25 M3,3 L17,3 M3,14 L14,14 M3,25 L17,25',
  F: 'M3,3 L3,25 M3,3 L17,3 M3,13 L14,13',
  G: 'M17,11 L10,3 L3,3 L3,25 L17,25 L17,15 M10,15 L17,15',
  H: 'M3,3 L3,25 M17,3 L17,25 M3,3 L10,9 L17,3 M3,25 L10,19 L17,25',
  I: 'M15,3 L5,25',
  J: 'M10,25 L10,3 M4,9 L10,3 L16,9',
  K: 'M10,3 L10,25 M3,3 L17,25 M17,3 L3,25',
  L: 'M17,3 L3,14 L17,25',
  M: 'M3,3 L3,25 M9,3 L9,25 M15,3 L15,25 M3,3 L15,3',
  N: 'M3,4 L17,4 M10,4 L10,25',
  O: 'M17,4 L3,4 L3,25',
  P: 'M3,3 L3,25 M3,9 L17,9 M3,20 L17,20',
  Q: 'M3,3 L17,3 L17,25 L3,25 L3,3 M8,11 L12,11 L12,17 L8,17 L8,11',
  R: 'M3,25 L10,3 L17,25',
  S: 'M15,4 C3,4 3,14 15,14 C15,14 15,25 3,25',
  T: 'M3,14 L17,14 M10,4 L10,7 M10,21 L10,24',
  U: 'M3,3 L3,21 C3,26 17,26 17,21 L17,3',
  V: 'M17,3 C3,3 3,14 17,14 C17,14 17,25 3,25',
  W: 'M3,25 L3,10 L10,3 L17,10 L17,25',
  X: 'M13,3 C17,3 17,9 13,14 L7,14 C3,14 3,21 7,25',
  Y: 'M3,25 L10,12 L17,25 M10,12 L10,3',
  Z: 'M7,3 L7,25 M13,3 L13,25',
  ' ': '',
  '!': 'M10,3 L10,19 M10,23 L10,25',
  '.': 'M9,22 L11,22 L11,25 L9,25 L9,22',
}

export function NinjargonText({
  word = '',
  size = 18,
  color = 'currentColor',
  className = '',
  title = '',
}) {
  const chars   = word.toUpperCase().split('')
  const cw      = 20   // char width in viewbox units
  const gap     = 5    // gap between chars
  const ch      = 28   // char height
  const total   = chars.length * (cw + gap) - gap

  if (!total) return null

  const scale  = size / ch
  const svgW   = total * scale
  const svgH   = ch * scale

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${total} ${ch}`}
      fill="none"
      aria-label={title || word}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {chars.map((char, i) => {
        const path = GLYPHS[char]
        if (!path) return null
        const dx = i * (cw + gap)
        return (
          <g key={i} transform={`translate(${dx}, 0)`}>
            <path
              d={path}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )
      })}
    </svg>
  )
}

// Preset decorative phrases used across the site
export function NinjargonBadge({ word, color = '#C9A227', size = 16, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-0.5 rounded ${className}`}
      style={{ border: `1px solid ${color}30` }}
      title={word}
    >
      <NinjargonText word={word} size={size} color={color} />
    </span>
  )
}
