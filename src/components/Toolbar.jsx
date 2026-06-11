import React, { useEffect, useRef, useState } from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { PlatformGlyph, StatusDot } from './Avatar.jsx';
import { IconSearch, IconClose, IconPlay, IconPause, Icon } from '../icons/index.jsx';

const TICKERS = [
  { sym: 'FTSE 100', price: 10303.82, pct: 0.48 },
  { sym: 'DAX', price: 24214.43, pct: 0.08 },
  { sym: 'CAC 40', price: 8196.31, pct: 0.42 },
  { sym: 'SX5P', price: 5188.95, pct: 0.68 },
  { sym: 'FTSE MIB', price: 50504.46, pct: 0.95 },
  { sym: 'IBEX 35', price: 18279.30, pct: 0.75 },
  { sym: 'S&P 500', price: 6012.28, pct: 0.33 },
  { sym: 'NASDAQ', price: 19432.40, pct: 0.51 },
  { sym: 'DOW', price: 44860.31, pct: 0.28 },
  { sym: 'NIKKEI', price: 39307.05, pct: 1.12 },
  { sym: 'HANG SENG', price: 19856.91, pct: -0.34 },
  { sym: 'BTC', price: 104782.50, pct: 2.14 },
  { sym: 'ETH', price: 3892.10, pct: 1.67 },
  { sym: 'SOL', price: 248.37, pct: 3.42 },
];

function MarketTicker({ darkMode, wsj }) {
  const [tickers, setTickers] = useState(() =>
    TICKERS.map((t) => ({ ...t, price: t.price + (Math.random() - 0.5) * t.price * 0.001 }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          const delta = (Math.random() - 0.48) * t.price * 0.0004;
          const newPrice = t.price + delta;
          const newPct = t.pct + (Math.random() - 0.48) * 0.03;
          return { ...t, price: newPrice, pct: newPct };
        })
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, minWidth: 0 }}>
      <button
        onClick={() => scroll(-1)}
        style={{
          width: 24, height: 24, borderRadius: 6, border: 'none', flexShrink: 0,
          background: 'transparent', color: darkMode ? '#6b7488' : '#7a8294',
          cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 14,
        }}
      >‹</button>
      <div
        ref={scrollRef}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 20, overflowX: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none', minWidth: 0,
        }}
      >
        <style>{`.ticker-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="ticker-scroll" ref={(el) => { if (el) scrollRef.current = el; }} style={{
          display: 'flex', alignItems: 'center', gap: 20, overflowX: 'auto',
          scrollbarWidth: 'none', flex: 1,
        }}>
          {tickers.map((t) => {
            const up = t.pct >= 0;
            return (
              <span key={t.sym} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--ui)', fontSize: 12, fontWeight: 600,
                whiteSpace: 'nowrap', flexShrink: 0,
                color: wsj ? '#333' : (darkMode ? '#c0c8da' : '#3a4258'),
              }}>
                <span style={{ fontWeight: 700 }}>{t.sym}</span>
                <span style={{ color: wsj ? '#666' : (darkMode ? '#a2aabe' : '#5a6376') }}>
                  {t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span style={{ color: up ? '#4caf50' : '#f44336' }}>
                  {up ? '+' : ''}{t.pct.toFixed(2)}%
                </span>
                <span style={{ color: up ? '#4caf50' : '#f44336', fontSize: 10 }}>
                  {up ? '▲' : '▼'}
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => scroll(1)}
        style={{
          width: 24, height: 24, borderRadius: 6, border: 'none', flexShrink: 0,
          background: 'transparent', color: darkMode ? '#6b7488' : '#7a8294',
          cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 14,
        }}
      >›</button>
    </div>
  );
}

export function Toolbar({
  filter,
  onFilter,
  sources,
  live,
  onToggleLive,
  query,
  onQuery,
  rate,
  viewers,
  viewerCount,
  connectedCount,
  accent,
  mobile,
  onMenuToggle,
  darkMode,
  theme,
}) {
  const wsj = theme === 'wsj';
  return (
    <header
      style={{
        flexShrink: 0,
        padding: mobile ? '14px 12px 10px' : '16px 26px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: mobile ? 10 : 12,
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Market ticker row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 14px', borderRadius: wsj ? 0 : 12,
        background: wsj ? '#FFFDF8' : (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)'),
        border: wsj ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.7)'),
        borderBottom: wsj ? '1px solid #D8D2C8' : undefined,
        borderTop: wsj ? '1px solid #D8D2C8' : undefined,
      }}>
        <MarketTicker darkMode={darkMode} wsj={wsj} />
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 18, flexWrap: mobile ? 'wrap' : 'nowrap' }}>
        {mobile && (
          <button
            onClick={onMenuToggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(14,22,42,0.1)',
              background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)',
              color: darkMode ? '#f0f3fb' : '#0e1424',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
          </button>
        )}

        {mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <img src="/brand-icon.svg" alt="" width={28} height={28} style={{ width: 28, height: 28, borderRadius: 5, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 17, color: darkMode ? '#f0f3fb' : '#0e1424', whiteSpace: 'nowrap' }}>Market Bubble</span>
          </div>
        )}

        {/* Stats */}
        <span
          style={{
            fontFamily: 'var(--ui)',
            fontSize: mobile ? 11 : 12.5,
            color: darkMode ? '#8a92a6' : '#6b7488',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontWeight: 500,
            flexShrink: 0,
            ...(mobile ? { order: 9, flex: '1 1 100%' } : {}),
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: live ? 'var(--accent-deep)' : '#a8b0c0' }} />
          {live ? <>{viewers} chatting · {rate} msg/min · <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#e53935', display: 'inline-block', animation: 'pulseDot 1.8s ease-in-out infinite', verticalAlign: 'middle', marginRight: 2 }} />{viewerCount} watching</> : 'feed paused'}
        </span>

        <div style={{ flex: 1 }} />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            flex: mobile ? '1 1 100%' : '1 1 280px',
            maxWidth: mobile ? 'none' : 300,
            minWidth: mobile ? 0 : 160,
            order: mobile ? 10 : 0,
            height: 42,
            padding: '0 14px',
            borderRadius: wsj ? 4 : 9999,
            background: wsj ? '#FFFDF8' : (darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)'),
            border: wsj ? '1px solid #D8D2C8' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.85)'),
            boxShadow: darkMode ? 'none' : (wsj ? 'none' : '0 2px 10px rgba(14,22,42,0.04)'),
            color: wsj ? '#666' : (darkMode ? '#a2aabe' : '#5a6376'),
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
              color: darkMode ? '#f0f3fb' : '#0e1424',
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
            boxShadow: wsj
              ? (live ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)')
              : (live ? '0 6px 18px rgba(180,224,52,0.35)' : '0 6px 18px rgba(14,22,42,0.18)'),
            cursor: 'pointer',
          }}
        >
          {live ? <IconPause size={16} /> : <IconPlay size={16} />}
          {live ? 'Live' : 'Paused'}
        </button>
      </div>
    </header>
  );
}
