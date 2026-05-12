import { Crown, Shield } from 'lucide-react'

export function UserBadge({ username, role = 'user', size = 'sm' }) {
  const isAdmin = role === 'admin'
  const isMod   = role === 'mod'
  const fontSize = size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : '1rem'
  const iconSize = size === 'sm' ? 11 : size === 'md' ? 13 : 16

  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize }}>
        <Crown
          size={iconSize}
          className="crown-anim"
          style={{ color: '#FFD700', filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.9))' }}
        />
        <span className="username-admin">{username}</span>
      </span>
    )
  }

  if (isMod) {
    return (
      <span className="inline-flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize }}>
        <Shield size={iconSize} style={{ color: '#60A5FA', filter: 'drop-shadow(0 0 3px rgba(96,165,250,0.7))' }} />
        <span className="username-mod">{username}</span>
      </span>
    )
  }

  return (
    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize, color: 'var(--text-m)' }}>
      {username}
    </span>
  )
}
