import React, { useRef, useState } from 'react';
import { Avatar, SourceBadge } from '../components/Avatar.jsx';
import { PLATFORMS } from '../data/platforms.js';
import { IconReply, IconPin, IconStar, IconHeart, IconHide, IconExternal } from '../icons/index.jsx';

export function ago(ts, now) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 5) return 'now';
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  return h + 'h';
}

function UserBadge({ kind }) {
  const label = { sub: 'SUB', mod: 'MOD', vip: 'VIP', verified: '✓', og: 'OG', broadcaster: 'STREAMER' }[kind] || kind.toUpperCase();
  return (
    <span
      style={{
        height: 17,
        padding: '0 6px',
        borderRadius: 5,
        display: 'inline-grid',
        placeItems: 'center',
        background: 'rgba(255,255,255,0.08)',
        color: '#b0b8cc',
        fontFamily: 'var(--ui)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </span>
  );
}

function PostPill() {
  return (
    <span
      style={{
        height: 17,
        padding: '0 6px',
        borderRadius: 5,
        display: 'inline-grid',
        placeItems: 'center',
        background: 'rgba(212,245,74,0.18)',
        color: 'var(--accent)',
        fontFamily: 'var(--ui)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
      }}
    >
      POST
    </span>
  );
}

function QuickAction({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: '#b0b8cc',
        transition: 'all .14s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent-ink)';
        e.currentTarget.style.background = 'var(--accent)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#b0b8cc';
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
      }}
    >
      {children}
    </button>
  );
}

export function FeedMessage({ m, now, accent, selected, onSelect, compact, isNew, onAction }) {
  const [hov, setHov] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const rowRef = useRef(null);
  const timerRef = useRef(null);
  const pad = compact ? '9px 14px' : '13px 16px';
  const nameColor = m.user.color || '#f0f3fb';

  const onEnter = () => {
    setHov(true);
    timerRef.current = setTimeout(() => setShowDetail(true), 400);
  };
  const onLeave = () => {
    setHov(false);
    setShowDetail(false);
    clearTimeout(timerRef.current);
  };

  return (
    <div
      ref={rowRef}
      onClick={() => onSelect(m)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: 'flex',
        gap: 12,
        padding: pad,
        borderRadius: compact ? 12 : 16,
        cursor: 'pointer',
        position: 'relative',
        background: selected ? 'rgba(255,255,255,0.07)' : hov ? 'rgba(255,255,255,0.035)' : 'transparent',
        boxShadow: selected
          ? 'inset 0 0 0 1px rgba(212,245,74,0.35)'
          : m.highlight
            ? 'inset 0 0 0 1px rgba(212,245,74,0.22)'
            : 'none',
        animation: isNew ? 'msgIn .34s cubic-bezier(.2,.7,.3,1)' : 'none',
        transition: 'background .14s ease',
      }}
    >
      <Avatar user={m.user} size={compact ? 30 : 38} accent={accent} tone="dark" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--ui)',
              fontWeight: 600,
              fontSize: compact ? 13 : 14,
              color: nameColor,
            }}
          >
            {m.user.name}
          </span>
          {m.user.badge && <UserBadge kind={m.user.badge} />}
          <SourceBadge id={m.platform} accent={accent} compact={compact} tone="dark" />
          {m.kind === 'post' && <PostPill />}
          <span style={{ fontFamily: 'var(--ui)', fontSize: 12, color: '#7b859c' }}>{ago(m.ts, now)}</span>
          {m.highlight && (
            <span
              style={{
                fontFamily: 'var(--ui)',
                fontSize: 11,
                color: 'var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
              }}
            >
              <IconStar size={12} /> mention
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: compact ? 13.5 : 14.5,
            lineHeight: 1.45,
            color: '#cdd3e2',
            textWrap: 'pretty',
            wordBreak: 'break-word',
          }}
        >
          {m.text}
        </div>
        {m.likes > 0 && !compact && (
          <div
            style={{
              marginTop: 7,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#8d97ac',
              fontFamily: 'var(--ui)',
              fontSize: 12,
            }}
          >
            <IconHeart size={13} /> {m.likes}
          </div>
        )}
      </div>

      {/* Quick action buttons on hover */}
      <div
        style={{
          display: 'flex',
          gap: 5,
          alignItems: 'flex-start',
          opacity: hov ? 1 : 0,
          transform: hov ? 'translateY(0)' : 'translateY(-2px)',
          transition: 'opacity .14s ease, transform .14s ease',
          pointerEvents: hov ? 'auto' : 'none',
        }}
      >
        <QuickAction title="Reply" onClick={(e) => { e.stopPropagation(); onAction('reply', m); }}>
          <IconReply size={15} />
        </QuickAction>
        <QuickAction title="Pin" onClick={(e) => { e.stopPropagation(); onAction('pin', m); }}>
          <IconPin size={15} />
        </QuickAction>
        <QuickAction title="Important" onClick={(e) => { e.stopPropagation(); onAction('important', m); }}>
          <IconStar size={15} />
        </QuickAction>
      </div>

      {/* Hover detail popover */}
      {showDetail && (
        <div
          style={{
            position: 'absolute',
            right: '100%',
            top: 0,
            marginRight: 8,
            width: 280,
            padding: '16px 18px',
            borderRadius: 18,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 16px 48px rgba(14,22,42,0.22), 0 0 0 1px rgba(14,22,42,0.04)',
            zIndex: 100,
            animation: 'msgIn .18s ease',
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
            <Avatar user={m.user} size={42} accent={accent} tone="light" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--ui)', fontWeight: 700, fontSize: 15, color: '#0c1220' }}>
                {m.user.name}
              </div>
              <div style={{ marginTop: 4 }}>
                <SourceBadge id={m.platform} accent={accent} tone="light" />
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'rgba(199,214,240,0.4)',
              border: '1px solid rgba(255,255,255,0.6)',
              fontSize: 13.5,
              lineHeight: 1.5,
              color: '#0e1424',
              wordBreak: 'break-word',
              marginBottom: 12,
            }}
          >
            {m.text}
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#7a8294', fontFamily: 'var(--ui)' }}>
              {ago(m.ts, now)} ago
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <HoverAction onClick={() => onAction('reply', m)} icon={<IconReply size={14} />}>Reply</HoverAction>
            <HoverAction onClick={() => onAction('pin', m)} icon={<IconPin size={14} />}>Pin</HoverAction>
            <HoverAction onClick={() => onAction('important', m)} icon={<IconStar size={14} />}>Important</HoverAction>
            <HoverAction onClick={() => onAction('hide', m)} icon={<IconHide size={14} />}>Hide</HoverAction>
          </div>
          <HoverAction
            onClick={() => onAction('open', m)}
            icon={<IconExternal size={14} />}
            dark
            style={{ marginTop: 6, width: '100%' }}
          >
            Open on {PLATFORMS[m.platform]?.name}
          </HoverAction>
        </div>
      )}
    </div>
  );
}

function HoverAction({ children, icon, onClick, dark, style }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        height: 34,
        borderRadius: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: dark ? (h ? '#1c2335' : '#0e1424') : (h ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'),
        color: dark ? '#f1f3fa' : '#0e1424',
        border: dark ? 'none' : '1px solid rgba(14,22,42,0.08)',
        fontFamily: 'var(--ui)',
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        transition: 'background .12s ease',
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}
