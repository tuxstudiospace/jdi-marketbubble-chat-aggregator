import React from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { PlatformGlyph, StatusDot } from './Avatar.jsx';
import { IconSearch, IconClose, IconPlay, IconPause } from '../icons/index.jsx';

export function Toolbar({
  filter,
  onFilter,
  sources,
  live,
  onToggleLive,
  query,
  onQuery,
  rate,
  connectedCount,
  accent,
}) {
  const chips = [{ id: 'all', name: 'All' }].concat(sources.map((s) => ({ id: s.id, name: PLATFORMS[s.id].name })));
  return (
    <header
      style={{
        flexShrink: 0,
        padding: '22px 26px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: '-0.035em',
              color: '#0c1220',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            Unified Live Feed
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--ui)',
              fontSize: 13,
              color: '#5a6376',
            }}
          >
            <StatusDot status={live ? 'connected' : 'disconnected'} />
            <span>
              {connectedCount} {connectedCount === 1 ? 'source' : 'sources'} · {live ? 'streaming live' : 'feed paused'}
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            flex: '1 1 280px',
            maxWidth: 300,
            minWidth: 160,
            height: 42,
            padding: '0 14px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 2px 10px rgba(14,22,42,0.04)',
            color: '#5a6376',
          }}
        >
          <IconSearch size={17} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search messages or users"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#0e1424',
              fontFamily: 'var(--sans)',
              fontSize: 14,
              width: '100%',
            }}
          />
          {query && (
            <button
              onClick={() => onQuery('')}
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                color: '#7a8294',
                cursor: 'pointer',
              }}
            >
              <IconClose size={14} />
            </button>
          )}
        </label>

        <button
          onClick={onToggleLive}
          style={{
            height: 42,
            padding: '0 18px 0 14px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: live ? 'var(--accent)' : '#0e1424',
            color: live ? 'var(--accent-ink)' : '#f1f3fa',
            border: 'none',
            fontFamily: 'var(--ui)',
            fontWeight: 600,
            fontSize: 14,
            transition: 'all .18s ease',
            boxShadow: live ? '0 6px 18px rgba(180,224,52,0.35)' : '0 6px 18px rgba(14,22,42,0.18)',
            cursor: 'pointer',
          }}
        >
          {live ? <IconPause size={16} /> : <IconPlay size={16} />}
          {live ? 'Live' : 'Paused'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {chips.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onFilter(c.id)}
              style={{
                height: 34,
                padding: c.id === 'all' ? '0 16px' : '0 15px 0 12px',
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: active ? '#0e1424' : 'rgba(255,255,255,0.55)',
                border: active ? '1px solid #0e1424' : '1px solid rgba(255,255,255,0.8)',
                color: active ? '#f1f3fa' : '#3a4258',
                fontFamily: 'var(--ui)',
                fontSize: 13.5,
                fontWeight: 600,
                transition: 'all .15s ease',
                cursor: 'pointer',
                boxShadow: active ? '0 4px 12px rgba(14,22,42,0.15)' : '0 1px 4px rgba(14,22,42,0.04)',
              }}
            >
              {c.id !== 'all' && <PlatformGlyph id={c.id} size={13} accent={accent} tone={active ? 'dark' : 'light'} />}
              {c.name}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--ui)',
            fontSize: 12.5,
            color: '#6b7488',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: live ? 'var(--accent-deep)' : '#a8b0c0',
            }}
          />
          {live ? `${rate} msg/min` : 'feed paused'}
        </span>
      </div>
    </header>
  );
}
