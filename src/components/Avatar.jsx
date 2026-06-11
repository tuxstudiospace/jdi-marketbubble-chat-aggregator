import React from 'react';
import { PLATFORMS } from '../data/platforms.js';

export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16),
    g = parseInt(n.slice(2, 4), 16),
    b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function avatarUrl(name, size) {
  const seed = encodeURIComponent(name || 'anon');
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&size=${size * 2}`;
}

export function Avatar({ user, size = 38, accent = false, ring = true, tone = 'dark' }) {
  const isLight = tone === 'light';
  const innerBorder = isLight
    ? 'inset 0 0 0 1px rgba(255,255,255,0.55)'
    : 'inset 0 0 0 1px rgba(255,255,255,0.06)';
  const brand = PLATFORMS[user.platform]?.brand || '#888';
  const src = user.avatar || avatarUrl(user.name, size);

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        flexShrink: 0,
        objectFit: 'cover',
        background: isLight
          ? 'linear-gradient(155deg, #cdd8ed, #aebbd7)'
          : 'linear-gradient(155deg, #2c324a, #1a2034)',
        boxShadow:
          ring && accent ? `${innerBorder}, 0 0 0 1.5px ${hexA(brand, 0.55)}` : innerBorder,
      }}
    />
  );
}

export function PlatformGlyph({ id, size = 16, accent = false, tone = 'dark' }) {
  const plat = PLATFORMS[id];
  if (!plat) return null;
  const stroke = accent ? plat.brand : tone === 'light' ? '#3a4258' : '#a2aabe';
  return (
    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: plat.glyph(size, stroke) }} />
  );
}

export function SourceBadge({ id, accent = false, compact = false, tone = 'dark' }) {
  const plat = PLATFORMS[id];
  if (!plat) return null;
  const isLight = tone === 'light';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 22,
        padding: compact ? '0 8px 0 7px' : '0 10px 0 8px',
        borderRadius: 9999,
        background: isLight ? 'rgba(14,22,42,0.05)' : 'rgba(255,255,255,0.07)',
        border: isLight ? '1px solid rgba(14,22,42,0.07)' : '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--ui)',
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: isLight ? '#3a4258' : '#a2aabe',
        whiteSpace: 'nowrap',
      }}
    >
      <PlatformGlyph id={id} size={13} accent={accent} tone={tone} />
      {!compact && plat.name}
    </span>
  );
}

export function StatusDot({ status }) {
  const map = {
    connected: { c: '#9ed127', live: true, label: 'Connected', glow: 'rgba(196,232,72,0.55)' },
    live: { c: '#9ed127', live: true, label: 'Live', glow: 'rgba(196,232,72,0.55)' },
    connecting: { c: '#8d96aa', live: true, label: 'Connecting', glow: 'transparent' },
    syncing: { c: '#8d96aa', live: true, label: 'Syncing', glow: 'transparent' },
    disconnected: { c: '#a8b0c0', live: false, label: 'Disconnected', glow: 'transparent' },
    error: { c: '#d96868', live: false, label: 'Error', glow: 'transparent' },
    idle: { c: '#a8b0c0', live: false, label: 'Idle', glow: 'transparent' },
  };
  const s = map[status] || map.idle;
  return (
    <span
      title={s.label}
      style={{
        width: 7,
        height: 7,
        borderRadius: 9999,
        background: s.c,
        flexShrink: 0,
        boxShadow: status === 'connected' || status === 'live' ? `0 0 8px ${s.glow}` : 'none',
        animation: s.live ? 'pulseDot 2.4s ease-in-out infinite' : 'none',
      }}
    />
  );
}
