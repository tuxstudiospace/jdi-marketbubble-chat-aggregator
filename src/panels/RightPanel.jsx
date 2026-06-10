import React, { useState } from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { Avatar, SourceBadge } from '../components/Avatar.jsx';
import {
  IconClose,
  IconReply,
  IconPin,
  IconStar,
  IconHide,
  IconHeart,
  IconExternal,
} from '../icons/index.jsx';
import { ago } from '../feed/FeedMessage.jsx';

export function RightPanel({ message, now, accent, onClose, onAction, recent = [] }) {
  return (
    <aside
      style={{
        width: 340,
        flexShrink: 0,
        height: '100%',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        borderLeft: '1px solid rgba(255,255,255,0.6)',
        boxShadow: 'inset 1px 0 0 rgba(14,22,42,0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          padding: '18px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ui)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#7a8294',
            fontWeight: 600,
          }}
        >
          Message detail
        </span>
        <button onClick={onClose} style={iconBtnLight} title="Close panel">
          <IconClose size={15} />
        </button>
      </div>
      <div style={{ height: 1, background: 'rgba(14,22,42,0.07)', margin: '0 18px' }} />

      {!message ? (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 28 }}>
          <div style={{ textAlign: 'center', maxWidth: 230 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                margin: '0 auto 16px',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(14,22,42,0.08)',
                color: '#5a6376',
              }}
            >
              <IconReply size={22} />
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#0e1424',
                fontWeight: 600,
                fontFamily: 'var(--ui)',
                marginBottom: 6,
              }}
            >
              No message selected
            </div>
            <div style={{ fontSize: 13.5, color: '#5a6376', lineHeight: 1.5 }}>
              Pick any message in the feed to see the sender and quick actions.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <Avatar user={message.user} size={54} accent={accent} tone="light" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--ui)',
                    fontWeight: 700,
                    fontSize: 17,
                    color: '#0c1220',
                  }}
                >
                  {message.user.name}
                </span>
                {message.user.badge && <UserBadgeLight kind={message.user.badge} />}
              </div>
              <div style={{ marginTop: 6 }}>
                <SourceBadge id={message.platform} accent={accent} tone="light" />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <PanelLabel>Selected message</PanelLabel>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(199,214,240,0.45)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxShadow: '0 6px 18px rgba(14,22,42,0.05)',
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: '#0e1424',
                  textWrap: 'pretty',
                  wordBreak: 'break-word',
                }}
              >
                {message.text}
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#5a6376',
                  fontFamily: 'var(--ui)',
                  fontSize: 12,
                }}
              >
                <span>{ago(message.ts, now)} ago</span>
                {message.likes > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <IconHeart size={12} /> {message.likes}
                  </span>
                )}
              </div>
            </div>
          </div>

          {recent.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <PanelLabel>Recent from {message.user.name}</PanelLabel>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
                {recent.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '11px 0',
                      borderBottom: i < recent.length - 1 ? '1px solid rgba(14,22,42,0.07)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 13.5, lineHeight: 1.45, color: '#1d2334' }}>{r.text}</div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: '#7a8294',
                        fontFamily: 'var(--ui)',
                        marginTop: 3,
                      }}
                    >
                      {r.ago} ago
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <PanelLabel>Quick actions</PanelLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <ActionBtn primary onClick={() => onAction('reply', message)} icon={<IconReply size={16} />}>
                Reply
              </ActionBtn>
              <ActionBtn onClick={() => onAction('pin', message)} icon={<IconPin size={16} />}>
                Pin
              </ActionBtn>
              <ActionBtn onClick={() => onAction('important', message)} icon={<IconStar size={16} />}>
                Important
              </ActionBtn>
              <ActionBtn onClick={() => onAction('hide', message)} icon={<IconHide size={16} />}>
                Hide
              </ActionBtn>
            </div>
            <ActionBtn
              dark
              wide
              onClick={() => onAction('open', message)}
              icon={<IconExternal size={16} />}
              style={{ marginTop: 8 }}
            >
              Open on {PLATFORMS[message.platform]?.name}
            </ActionBtn>
          </div>
        </div>
      )}
    </aside>
  );
}

function UserBadgeLight({ kind }) {
  const label = { sub: 'SUB', mod: 'MOD', vip: 'VIP', verified: '✓', og: 'OG', broadcaster: 'STREAMER' }[kind] || kind.toUpperCase();
  return (
    <span
      style={{
        height: 17,
        padding: '0 6px',
        borderRadius: 5,
        display: 'inline-grid',
        placeItems: 'center',
        background: 'rgba(14,22,42,0.08)',
        color: '#3a4258',
        fontFamily: 'var(--ui)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </span>
  );
}

function PanelLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: 'var(--ui)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#7a8294',
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

export function ActionBtn({ children, icon, onClick, primary, dark, wide, style }) {
  const [hov, setHov] = useState(false);
  let bg, color, border, shadow;
  if (primary) {
    bg = hov ? 'var(--accent-deep)' : 'var(--accent)';
    color = 'var(--accent-ink)';
    border = 'none';
    shadow = '0 6px 18px rgba(180,224,52,0.35)';
  } else if (dark) {
    bg = hov ? '#1c2335' : '#0e1424';
    color = '#f1f3fa';
    border = 'none';
    shadow = '0 4px 12px rgba(14,22,42,0.18)';
  } else {
    bg = hov ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)';
    color = '#0e1424';
    border = '1px solid rgba(14,22,42,0.08)';
    shadow = '0 1px 4px rgba(14,22,42,0.04)';
  }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 42,
        borderRadius: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        gridColumn: wide ? '1 / -1' : 'auto',
        background: bg,
        color,
        border,
        fontFamily: 'var(--ui)',
        fontWeight: 600,
        fontSize: 13.5,
        transition: 'background .14s ease',
        cursor: 'pointer',
        boxShadow: shadow,
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

const iconBtnLight = {
  width: 32,
  height: 32,
  borderRadius: 9,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(14,22,42,0.08)',
  color: '#3a4258',
  cursor: 'pointer',
};
