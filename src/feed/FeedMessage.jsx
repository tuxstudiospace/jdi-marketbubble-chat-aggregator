import React, { useState } from 'react';
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
      className="feed-msg-badge"
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
      className="feed-msg-action"
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
  const pad = compact ? '9px 14px' : '13px 16px';
  const nameColor = m.user.color || '#f0f3fb';

  return (
    <div
      className="feed-message"
      style={{
        borderRadius: compact ? 12 : 16,
        background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
        boxShadow: selected
          ? 'inset 0 0 0 1px rgba(212,245,74,0.35)'
          : m.highlight
            ? 'inset 0 0 0 1px rgba(212,245,74,0.22)'
            : 'none',
        animation: isNew ? 'msgIn .34s cubic-bezier(.2,.7,.3,1)' : 'none',
        transition: 'background .14s ease',
        overflow: 'hidden',
      }}
    >
      {/* Message row */}
      <div
        onClick={() => onSelect(selected ? null : m)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex',
          gap: 12,
          padding: pad,
          cursor: 'pointer',
          background: hov && !selected ? 'rgba(255,255,255,0.035)' : 'transparent',
          transition: 'background .14s ease',
        }}
      >
        <Avatar user={m.user} size={compact ? 30 : 38} accent={accent} tone="dark" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span className="feed-msg-name" style={{ fontFamily: 'var(--ui)', fontWeight: 600, fontSize: compact ? 13 : 14, color: nameColor }}>
              {m.user.name}
            </span>
            {m.user.badge && <UserBadge kind={m.user.badge} />}
            <SourceBadge id={m.platform} accent={accent} compact={compact} tone="dark" />
            {m.kind === 'post' && <PostPill />}
            <span className="feed-msg-time" style={{ fontFamily: 'var(--ui)', fontSize: 12, color: '#7b859c' }}>{ago(m.ts, now)}</span>
            {m.highlight && (
              <span style={{ fontFamily: 'var(--ui)', fontSize: 11, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <IconStar size={12} /> mention
              </span>
            )}
          </div>
          <div className="feed-msg-text" style={{ marginTop: 4, fontSize: compact ? 13.5 : 14.5, lineHeight: 1.45, color: '#cdd3e2', textWrap: 'pretty', wordBreak: 'break-word' }}>
            {m.text}
          </div>
          {m.likes > 0 && !compact && (
            <div className="feed-msg-likes" style={{ marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8d97ac', fontFamily: 'var(--ui)', fontSize: 12 }}>
              <IconHeart size={13} /> {m.likes}
            </div>
          )}
        </div>

        {/* Quick action buttons on hover */}
        <div
          style={{
            display: 'flex', gap: 5, alignItems: 'flex-start',
            opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(-2px)',
            transition: 'opacity .14s ease, transform .14s ease', pointerEvents: hov ? 'auto' : 'none',
          }}
        >
          <QuickAction title="Reply" onClick={(e) => { e.stopPropagation(); onAction('reply', m); }}><IconReply size={15} /></QuickAction>
          <QuickAction title="Pin" onClick={(e) => { e.stopPropagation(); onAction('pin', m); }}><IconPin size={15} /></QuickAction>
          <QuickAction title="Important" onClick={(e) => { e.stopPropagation(); onAction('important', m); }}><IconStar size={15} /></QuickAction>
        </div>
      </div>

      {/* Accordion detail section */}
      {selected && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '0 16px 14px',
            marginLeft: compact ? 42 : 50,
            animation: 'accordionIn .2s ease',
          }}
        >
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <AccordionBtn onClick={() => onAction('reply', m)} icon={<IconReply size={13} />}>Reply</AccordionBtn>
            <AccordionBtn onClick={() => onAction('pin', m)} icon={<IconPin size={13} />}>Pin</AccordionBtn>
            <AccordionBtn onClick={() => onAction('important', m)} icon={<IconStar size={13} />}>Important</AccordionBtn>
            <AccordionBtn onClick={() => onAction('hide', m)} icon={<IconHide size={13} />}>Hide</AccordionBtn>
            <AccordionBtn onClick={() => onAction('open', m)} icon={<IconExternal size={13} />} accent>
              Open on {PLATFORMS[m.platform]?.name}
            </AccordionBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function AccordionBtn({ children, icon, onClick, accent }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        height: 30,
        padding: '0 12px',
        borderRadius: 9999,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: accent
          ? (h ? 'var(--accent-deep)' : 'rgba(212,245,74,0.12)')
          : (h ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'),
        color: accent
          ? (h ? 'var(--accent-ink)' : 'var(--accent)')
          : (h ? '#f0f3fb' : '#b0b8cc'),
        border: accent
          ? '1px solid rgba(212,245,74,0.28)'
          : '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--ui)',
        fontWeight: 600,
        fontSize: 11.5,
        cursor: 'pointer',
        transition: 'all .12s ease',
      }}
    >
      {icon}{children}
    </button>
  );
}
