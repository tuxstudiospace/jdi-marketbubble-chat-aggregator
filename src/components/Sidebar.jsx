import React, { useState } from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { Avatar, PlatformGlyph, StatusDot } from './Avatar.jsx';
import { Icon, IconPlus, IconSliders } from '../icons/index.jsx';
import { ChannelPicker } from './ChannelPicker.jsx';

function statusLabel(s) {
  if (s.status === 'live' || s.status === 'connected') return s.viewers ? `Live · ${s.viewers}` : 'Live';
  if (s.status === 'connecting' || s.status === 'syncing') return 'Connecting…';
  if (s.status === 'disconnected') return 'Idle';
  if (s.status === 'error') return 'Connection failed';
  return 'No channels';
}

function AllGlyph({ active, wsj, darkMode }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        background: wsj
          ? (active ? '#fff' : '#F5F1EB')
          : (active ? '#0e1424' : 'rgba(14,22,42,0.045)'),
        border: wsj ? '1px solid #C8C2B8' : '1px solid rgba(14,22,42,0.06)',
        display: 'grid',
        placeItems: 'center',
        color: wsj
          ? (active ? '#222' : '#666')
          : (active ? 'var(--accent)' : '#3a4258'),
        transition: 'background .15s ease',
      }}
    >
      <Icon size={16}>
        <path d="M5 7h14M5 12h14M5 17h9" />
      </Icon>
    </div>
  );
}

function SidebarItem({
  active,
  onClick,
  leading,
  label,
  count,
  sub,
  statusNode,
  muted,
  expandable,
  expanded,
  onExpandToggle,
  expandedContent,
  darkMode,
  wsj,
}) {
  const [hov, setHov] = useState(false);
  return (
    <div>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: '100%',
          border: 'none',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '9px 10px',
          borderRadius: 13,
          background: wsj
            ? (active ? '#fff' : (hov ? '#F5F1EB' : 'transparent'))
            : (active
              ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)')
              : hov
                ? (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)')
                : 'transparent'),
          boxShadow: wsj
            ? (active ? '0 2px 8px rgba(0,0,0,0.06), inset 0 0 0 1px #C8C2B8' : 'none')
            : (active
              ? (darkMode ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : '0 4px 14px rgba(14,22,42,0.06), inset 0 0 0 1px rgba(14,22,42,0.06)')
              : 'none'),
          opacity: muted ? 0.62 : 1,
          transition: 'background .15s ease',
          position: 'relative',
        }}
      >
        {active && (
          <span
            style={{
              position: 'absolute',
              left: -4,
              top: 12,
              bottom: 12,
              width: 3,
              borderRadius: 9999,
              background: 'var(--accent)',
            }}
          />
        )}
        {leading}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: wsj ? '#222' : (darkMode ? '#f0f3fb' : '#0e1424'),
              fontFamily: 'var(--ui)',
              lineHeight: 1.25,
            }}
          >
            {label}
          </div>
          {statusNode ||
            (sub && (
              <div style={{ fontSize: 12, color: wsj ? '#888' : '#7a8294', fontFamily: 'var(--ui)', marginTop: 2 }}>
                {sub}
              </div>
            ))}
        </div>
        {count > 0 && (
          <span
            style={{
              minWidth: 22,
              height: 20,
              padding: '0 7px',
              borderRadius: 9999,
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              fontFamily: 'var(--ui)',
              fontSize: 11.5,
              fontWeight: 700,
              display: 'grid',
              placeItems: 'center',
              boxShadow: wsj ? '0 2px 6px rgba(0,0,0,0.15)' : '0 2px 6px rgba(180,220,40,0.35)',
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
        {expandable && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle();
            }}
            style={{
              width: 22,
              height: 22,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 6,
              color: '#7a8294',
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform .15s ease',
            }}
          >
            <Icon size={14}>
              <path d="M9 6l6 6-6 6" />
            </Icon>
          </span>
        )}
      </button>
      {expandable && expanded && (
        <div style={{ padding: '4px 10px 10px 52px' }}>{expandedContent}</div>
      )}
    </div>
  );
}

export function Sidebar({ sources, filter, onFilter, accent, counts, totalUnread, channels, onAddChannel, onRemoveChannel, mobile, onTweaksToggle, darkMode, theme, collapsed, onCollapse }) {
  const wsj = theme === 'wsj';
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (collapsed && !mobile) {
    return (
      <aside
        style={{
          width: 56,
          flexShrink: 0,
          height: '100%',
          background: darkMode ? 'rgba(14,20,36,0.85)' : 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(28px) saturate(140%)',
          WebkitBackdropFilter: 'blur(28px) saturate(140%)',
          borderRight: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 0',
          gap: 8,
          position: 'relative',
          zIndex: 2,
          transition: 'width .2s ease',
        }}
      >
        <img src="/brand-icon.svg" alt="" width={34} height={34} style={{ width: 34, height: 34, borderRadius: 5, marginBottom: 8 }} />
        <button
          onClick={onCollapse}
          title="Expand sidebar"
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'transparent', color: darkMode ? '#a2aabe' : '#5a6376',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
          }}
        >
          <Icon size={16}><path d="M9 6l6 6-6 6" /></Icon>
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        height: '100%',
        background: wsj ? '#FFFDF8' : (darkMode ? 'rgba(14,20,36,0.85)' : 'rgba(255,255,255,0.55)'),
        backdropFilter: wsj ? 'none' : 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: wsj ? 'none' : 'blur(28px) saturate(140%)',
        borderRight: wsj ? '1px solid #D8D2C8' : (darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.6)'),
        boxShadow: wsj ? 'none' : (darkMode ? 'inset -1px 0 0 rgba(255,255,255,0.04)' : 'inset -1px 0 0 rgba(14,22,42,0.04)'),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
        transition: 'width .2s ease',
      }}
    >
      <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/brand-icon.svg"
          alt=""
          width={44}
          height={44}
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            color: '#0e1424',
          }}
        />
        <div
          className="sidebar-brand"
          style={{
            fontFamily: 'var(--ui)',
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: '-0.01em',
            color: wsj ? '#222' : (darkMode ? '#f0f3fb' : '#0e1424'),
            flex: 1,
          }}
        >
          Market Bubble
        </div>
        {!mobile && onCollapse && (
          <button
            onClick={onCollapse}
            title="Close sidebar"
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(14,22,42,0.1)',
              background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
              color: darkMode ? '#a2aabe' : '#5a6376',
              cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}
          >
            <Icon size={14}><path d="M15 6l-6 6 6 6" /></Icon>
          </button>
        )}
      </div>

      <div style={{ height: 1, background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(14,22,42,0.07)', margin: '0 18px' }} />

      <div style={{ padding: '16px 14px 6px' }}>
        <SidebarItem
          active={filter === 'all'}
          onClick={() => onFilter('all')}
          leading={<AllGlyph active={filter === 'all'} wsj={wsj} darkMode={darkMode} />}
          label="All sources"
          count={totalUnread}
          sub="Unified feed"
          darkMode={darkMode}
          wsj={wsj}
        />
      </div>

      <div
        style={{
          padding: '10px 24px 8px',
          fontFamily: 'var(--ui)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#7a8294',
          fontWeight: 600,
        }}
      >
        Sources
      </div>

      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', flex: 1 }}>
        {sources.map((s) => (
          <SidebarItem
            key={s.id}
            active={filter === s.id}
            onClick={() => onFilter(s.id)}
            leading={
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: wsj
                    ? (filter === s.id ? '#fff' : '#F5F1EB')
                    : (filter === s.id ? '#0e1424' : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(14,22,42,0.045)')),
                  border: wsj ? '1px solid #C8C2B8' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(14,22,42,0.06)'),
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'background .15s ease',
                }}
              >
                <PlatformGlyph id={s.id} size={16} accent={accent} tone={filter === s.id ? 'dark' : 'light'} />
              </div>
            }
            label={PLATFORMS[s.id].name}
            count={counts[s.id] || 0}
            statusNode={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot status={s.status} />
                <span style={{ fontSize: 12, color: '#7a8294', fontFamily: 'var(--ui)' }}>
                  {statusLabel(s)}
                </span>
              </div>
            }
            darkMode={darkMode}
            wsj={wsj}
            muted={s.status === 'disconnected' || s.status === 'error' || s.status === 'idle'}
            expandable
            expanded={!!expanded[s.id]}
            onExpandToggle={() => toggle(s.id)}
            expandedContent={
              <ChannelPicker
                source={s.id}
                channels={channels[s.id] || []}
                onAdd={(name) => onAddChannel(s.id, name)}
                onRemove={(name) => onRemoveChannel(s.id, name)}
              />
            }
          />
        ))}
      </div>

      <div style={{ height: 1, background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(14,22,42,0.07)', margin: '0 18px' }} />
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar
          user={{ name: 'You', platform: 'twitch' }}
          size={34}
          accent={false}
          ring
          tone="light"
        />
        <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <div
            style={{ fontSize: 13.5, fontWeight: 600, color: darkMode ? '#f0f3fb' : '#0e1424', fontFamily: 'var(--ui)' }}
          >
            Market Bubble User
          </div>
          <div style={{ fontSize: 12, color: '#7a8294', fontFamily: 'var(--ui)' }}>@demo · Sign out</div>
        </div>
        <button
          onClick={onTweaksToggle}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(14,22,42,0.1)',
            background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
            color: darkMode ? '#a2aabe' : '#3a4258',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          title="Tweaks"
        >
          <IconSliders size={14} />
        </button>
      </div>
    </aside>
  );
}
