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

function AllGlyph({ active }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        background: active ? '#0e1424' : 'rgba(14,22,42,0.045)',
        border: '1px solid rgba(14,22,42,0.06)',
        display: 'grid',
        placeItems: 'center',
        color: active ? 'var(--accent)' : '#3a4258',
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
          background: active
            ? 'rgba(255,255,255,0.85)'
            : hov
              ? 'rgba(255,255,255,0.45)'
              : 'transparent',
          boxShadow: active ? '0 4px 14px rgba(14,22,42,0.06), inset 0 0 0 1px rgba(14,22,42,0.06)' : 'none',
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
              color: '#0e1424',
              fontFamily: 'var(--ui)',
              lineHeight: 1.25,
            }}
          >
            {label}
          </div>
          {statusNode ||
            (sub && (
              <div style={{ fontSize: 12, color: '#7a8294', fontFamily: 'var(--ui)', marginTop: 2 }}>
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
              boxShadow: '0 2px 6px rgba(180,220,40,0.35)',
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

export function Sidebar({ sources, filter, onFilter, accent, counts, totalUnread, channels, onAddChannel, onRemoveChannel }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        height: '100%',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        borderRight: '1px solid rgba(255,255,255,0.6)',
        boxShadow: 'inset -1px 0 0 rgba(14,22,42,0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/brand-icon.svg"
          alt=""
          width={28}
          height={28}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            color: '#0e1424',
          }}
        />
        <div
          style={{
            fontFamily: 'var(--ui)',
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '-0.01em',
            color: '#0e1424',
          }}
        >
          Market Bubble
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(14,22,42,0.07)', margin: '0 18px' }} />

      <div style={{ padding: '16px 14px 6px' }}>
        <SidebarItem
          active={filter === 'all'}
          onClick={() => onFilter('all')}
          leading={<AllGlyph active={filter === 'all'} />}
          label="All sources"
          count={totalUnread}
          sub="Unified feed"
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
                  background: filter === s.id ? '#0e1424' : 'rgba(14,22,42,0.045)',
                  border: '1px solid rgba(14,22,42,0.06)',
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

      <div style={{ height: 1, background: 'rgba(14,22,42,0.07)', margin: '0 18px' }} />
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
            style={{ fontSize: 13.5, fontWeight: 600, color: '#0e1424', fontFamily: 'var(--ui)' }}
          >
            Creator workspace
          </div>
          <div style={{ fontSize: 12, color: '#7a8294', fontFamily: 'var(--ui)' }}>Local · no account</div>
        </div>
        <button
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: '1px solid rgba(14,22,42,0.1)',
            background: 'rgba(255,255,255,0.6)',
            color: '#3a4258',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconSliders size={14} />
        </button>
      </div>
    </aside>
  );
}
