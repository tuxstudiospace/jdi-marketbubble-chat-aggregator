import React from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { Icon, IconPlug, IconAlert, IconBolt, IconReply } from '../icons/index.jsx';
import { ActionBtn } from '../panels/RightPanel.jsx';

export function LoadingState() {
  return (
    <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <SyncBanner />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 16px' }}>
          <Skel w={38} h={38} r={9999} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Skel w={90} h={13} />
              <Skel w={64} h={13} />
            </div>
            <Skel w={'72%'} h={13} style={{ marginTop: 10 }} />
            <Skel w={'48%'} h={13} style={{ marginTop: 7 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SyncBanner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        margin: '0 0 4px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          width: 15,
          height: 15,
          borderRadius: 9999,
          border: '1.6px solid rgba(255,255,255,0.25)',
          borderTopColor: 'var(--accent)',
          animation: 'spin .8s linear infinite',
        }}
      />
      <span style={{ fontFamily: 'var(--ui)', fontSize: 13, color: '#cdd3e2' }}>
        Syncing chat from connected sources…
      </span>
    </div>
  );
}

function Skel({ w, h, r = 7, style }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%)',
        backgroundSize: '680px 100%',
        animation: 'shimmer 1.5s linear infinite',
        ...style,
      }}
    />
  );
}

export function EmptyState({ filter, hasChannels }) {
  return (
    <CenterCard
      icon={
        <Icon size={26}>
          <path d="M5 7h14M5 12h14M5 17h9" />
        </Icon>
      }
      title={hasChannels ? 'No messages yet' : 'Add a source to start'}
      body={
        hasChannels
          ? filter === 'all'
            ? 'Your sources are connected and listening. New messages will appear here the moment your community starts chatting.'
            : `No recent messages on ${PLATFORMS[filter]?.name || filter}. Switch to All to see the unified feed.`
          : 'Open the sidebar, pick Twitch / Kick / X, and enter a channel name to begin streaming a live unified feed.'
      }
    />
  );
}

export function DisconnectedState({ name, onReconnect }) {
  return (
    <CenterCard
      icon={<IconPlug size={26} />}
      tone="muted"
      title={`${name} is disconnected`}
      body={`We stopped receiving messages from ${name}. Other sources are still live in your feed.`}
      action={
        <ActionBtn primary onClick={onReconnect} icon={<IconBolt size={15} />} style={{ width: 200 }}>
          Reconnect {name}
        </ActionBtn>
      }
    />
  );
}

export function ErrorState({ name, onRetry }) {
  return (
    <CenterCard
      icon={<IconAlert size={26} />}
      tone="error"
      title={`Couldn't connect to ${name}`}
      body={`The ${name} connection failed. The channel may be offline, misspelled, or temporarily unavailable.`}
      action={
        <ActionBtn primary onClick={onRetry} icon={<IconBolt size={15} />} style={{ width: 180 }}>
          Try again
        </ActionBtn>
      }
    />
  );
}

function CenterCard({ icon, title, body, action, tone }) {
  const ring = tone === 'error' ? 'rgba(217,104,104,0.45)' : 'rgba(255,255,255,0.18)';
  const ic = tone === 'error' ? '#e08a8a' : '#cdd3e2';
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 9999,
            margin: '0 auto 18px',
            display: 'grid',
            placeItems: 'center',
            border: `1px solid ${ring}`,
            color: ic,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#f0f3fb',
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: '#9098ad', textWrap: 'pretty' }}>
          {body}
        </div>
        {action && <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>{action}</div>}
      </div>
    </div>
  );
}
