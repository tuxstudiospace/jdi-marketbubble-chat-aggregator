import React, { useMemo, useState } from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { PlatformGlyph } from './Avatar.jsx';

// Embedded live player for Twitch / Kick channels (X has no video).
// Twitch requires a `parent` query param matching the embedding host.

function embedUrl(source, channel) {
  if (source === 'twitch') {
    const parent = window.location.hostname || 'localhost';
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${parent}&muted=true&autoplay=true`;
  }
  if (source === 'kick') {
    return `https://player.kick.com/${encodeURIComponent(channel)}?muted=true&autoplay=true`;
  }
  return null;
}

export function VideoPanel({ channels, accent }) {
  // Watchable streams: twitch + kick only.
  const streams = useMemo(() => {
    const out = [];
    for (const source of ['twitch', 'kick']) {
      for (const ch of channels[source] || []) out.push({ source, channel: ch });
    }
    return out;
  }, [channels]);

  const [activeKey, setActiveKey] = useState(null);

  if (streams.length === 0) return null;

  const active =
    streams.find((s) => `${s.source}:${s.channel}` === activeKey) || streams[0];
  const url = embedUrl(active.source, active.channel);

  return (
    <div
      style={{
        margin: '0 22px 14px',
        borderRadius: 28,
        background: '#0c1020',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 22px 60px rgba(14,22,42,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          overflowX: 'auto',
        }}
      >
        {streams.map((s) => {
          const key = `${s.source}:${s.channel}`;
          const isActive = key === `${active.source}:${active.channel}`;
          const brand = PLATFORMS[s.source]?.brand || '#888';
          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 30,
                padding: '0 13px',
                borderRadius: 9999,
                border: isActive
                  ? `1px solid ${accent ? brand : 'rgba(212,245,74,0.4)'}`
                  : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#f0f3fb' : '#a2aabe',
                fontFamily: 'var(--ui)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <PlatformGlyph id={s.source} size={13} accent={isActive} />
              {s.channel}
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', maxHeight: '46vh' }}>
        <iframe
          key={url}
          src={url}
          title={`${active.source} stream: ${active.channel}`}
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
