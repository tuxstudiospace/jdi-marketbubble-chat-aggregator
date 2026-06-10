import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { FeedMessage } from './feed/FeedMessage.jsx';
import { LoadingState, EmptyState, DisconnectedState, ErrorState } from './feed/EdgeStates.jsx';
import { RightPanel } from './panels/RightPanel.jsx';
import { DevSwitcher } from './panels/DevSwitcher.jsx';
import {
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
  TweakColorHue,
  useTweaks,
} from './tweaks/TweaksPanel.jsx';
import { IconCheck } from './icons/index.jsx';
import { PLATFORMS, SOURCE_IDS } from './data/platforms.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useChatStream } from './hooks/useChatStream.js';

const TWEAK_DEFAULTS = {
  accents: false,
  detailPanel: true,
  density: 'comfortable',
  glowHue: 222,
};

const DEFAULT_CHANNELS = {
  twitch: ['xqc', 'kai_cenat', 'trainwreckstv'],
  x: ['elonmusk', 'nasa'],
  kick: ['xqc', 'adin'],
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [channels, setChannels] = useLocalStorage('uca:channels:v2', DEFAULT_CHANNELS);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [unread, setUnread] = useState({ twitch: 0, x: 0, kick: 0 });
  const [previewState, setPreviewState] = useState(null); // null = live mode
  const [toast, setToast] = useState(null);

  const filterRef = useRef('all');
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const { messages, sourceStatus, clearMessages } = useChatStream(channels, { paused });

  // Bump unread on new messages when not focused on that source.
  const lastMsgIdRef = useRef(null);
  const [newSet, setNewSet] = useState(() => new Set());
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.id === lastMsgIdRef.current) return;
    lastMsgIdRef.current = last.id;
    setNewSet((prev) => {
      const n = new Set(prev);
      n.add(last.id);
      return n;
    });
    const id = last.id;
    setTimeout(() => {
      setNewSet((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }, 420);
    const cur = filterRef.current;
    if (cur !== 'all' && cur !== last.platform) {
      setUnread((prev) => ({
        ...prev,
        [last.platform]: Math.min(99, (prev[last.platform] || 0) + 1),
      }));
    }
  }, [messages]);

  const selectFilter = useCallback((f) => {
    setFilter(f);
    stickRef.current = true;
    setUnread((prev) => {
      if (f === 'all') return { twitch: 0, x: 0, kick: 0 };
      return { ...prev, [f]: 0 };
    });
  }, []);

  useEffect(() => {
    const on = () => setWinW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const compact = t.density === 'compact';
  const showPanel = t.detailPanel && winW > 1160;
  const feedRef = useRef(null);
  const stickRef = useRef(true);

  // Atmospheric glow hue tweak → CSS var.
  useEffect(() => {
    document.documentElement.style.setProperty('--glow-hue', t.glowHue);
  }, [t.glowHue]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, compact, previewState]);

  const onScroll = useCallback((e) => {
    const el = e.currentTarget;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = messages.filter((m) => {
    if (filter !== 'all' && m.platform !== filter) return false;
    if (q && !(m.text.toLowerCase().includes(q) || m.user.name.toLowerCase().includes(q))) return false;
    return true;
  });

  const totalUnread = unread.twitch + unread.x + unread.kick;

  // Build sources list with current statuses.
  const sources = SOURCE_IDS.map((id) => ({
    id,
    status: sourceStatus[id] || 'idle',
  }));
  const connectedCount = sources.filter((s) => s.status === 'live').length;

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 1900);
  };

  const onAction = (kind, m) => {
    const label = PLATFORMS[m.platform]?.name || m.platform;
    const map = {
      reply: `Replying to ${m.user.name} on ${label}`,
      pin: `Pinned ${m.user.name}'s message`,
      important: 'Marked as important',
      hide: 'Message hidden',
      open: `Opening on ${label}…`,
    };
    flash(map[kind] || 'Done');
    if (kind === 'open') {
      const url =
        m.platform === 'twitch'
          ? `https://twitch.tv/${m.channel}`
          : m.platform === 'kick'
            ? `https://kick.com/${m.channel}`
            : `https://x.com/${m.user.screen || m.user.name}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const addChannel = (source, name) => {
    setChannels((prev) => {
      const list = prev[source] || [];
      if (list.includes(name)) return prev;
      return { ...prev, [source]: list.concat(name) };
    });
    flash(`Added ${PLATFORMS[source]?.name || source}: ${name}`);
  };

  const removeChannel = (source, name) => {
    setChannels((prev) => ({
      ...prev,
      [source]: (prev[source] || []).filter((c) => c !== name),
    }));
  };

  const reconnect = () => {
    setPreviewState(null);
    flash('Resumed live feed');
  };

  const overlayState = previewState; // string or null
  const showOverlay = overlayState && ['empty', 'loading', 'disconnected', 'error'].includes(overlayState);

  // Decide which "empty" message to show when no preview override is active.
  const hasAnyChannels = Object.values(channels).some((arr) => arr.length > 0);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 1 }}>
      <Sidebar
        sources={sources}
        filter={filter}
        onFilter={selectFilter}
        accent={t.accents}
        counts={unread}
        totalUnread={totalUnread}
        channels={channels}
        onAddChannel={addChannel}
        onRemoveChannel={removeChannel}
      />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Toolbar
          filter={filter}
          onFilter={selectFilter}
          sources={sources}
          live={!paused && connectedCount > 0}
          onToggleLive={() => setPaused((p) => !p)}
          query={query}
          onQuery={setQuery}
          rate={messages.length > 0 ? Math.min(120, messages.length) : 0}
          connectedCount={connectedCount}
          accent={t.accents}
        />

        <div
          className="feed-panel"
          style={{
            flex: 1,
            minHeight: 0,
            margin: '0 22px 22px',
            borderRadius: 28,
            background: '#14182c',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 22px 60px rgba(14,22,42,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '18px 22px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--ui)',
                fontSize: 14.5,
                fontWeight: 700,
                color: '#f0f3fb',
                letterSpacing: '-0.005em',
              }}
            >
              {filter === 'all' ? 'Live feed' : `${PLATFORMS[filter]?.name || filter} feed`}
            </span>
            <span
              style={{
                minWidth: 26,
                height: 22,
                padding: '0 8px',
                borderRadius: 9999,
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                fontFamily: 'var(--ui)',
                fontSize: 12,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {filtered.length}
            </span>
            <div style={{ flex: 1 }} />
            {!paused && connectedCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  height: 26,
                  padding: '0 11px',
                  borderRadius: 9999,
                  background: 'rgba(212,245,74,0.12)',
                  border: '1px solid rgba(212,245,74,0.28)',
                  color: 'var(--accent)',
                  fontFamily: 'var(--ui)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    background: 'var(--accent)',
                    animation: 'glowPulse 1.6s ease-in-out infinite',
                  }}
                />
                LIVE
              </span>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                style={{
                  height: 26,
                  padding: '0 11px',
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#b0b8cc',
                  fontFamily: 'var(--ui)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div
            ref={feedRef}
            onScroll={onScroll}
            style={{
              flex: 1,
              overflowY: showOverlay && overlayState !== 'empty' ? 'hidden' : 'auto',
              padding: showOverlay ? 0 : '8px 10px 14px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {overlayState === 'loading' && <LoadingState />}
            {overlayState === 'error' && <ErrorState name="Source" onRetry={reconnect} />}
            {overlayState === 'disconnected' && (
              <DisconnectedState name="Source" onReconnect={reconnect} />
            )}
            {overlayState === 'empty' && <EmptyState filter={filter} hasChannels={hasAnyChannels} />}
            {!overlayState &&
              (filtered.length === 0 ? (
                <EmptyState filter={filter} hasChannels={hasAnyChannels} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 1 : 3 }}>
                  {filtered.map((m) => (
                    <FeedMessage
                      key={m.id}
                      m={m}
                      now={now}
                      accent={t.accents}
                      compact={compact}
                      selected={selected && selected.id === m.id}
                      isNew={newSet.has(m.id)}
                      onSelect={(msg) => setSelected(msg)}
                      onAction={onAction}
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </main>

      {showPanel && (
        <RightPanel
          message={selected}
          now={now}
          accent={t.accents}
          onClose={() => setSelected(null)}
          onAction={onAction}
        />
      )}

      <DevSwitcher
        state={previewState || 'connected'}
        onState={(s) => {
          setPreviewState(s === 'connected' ? null : s);
          stickRef.current = true;
        }}
      />

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            height: 42,
            padding: '0 18px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            background: '#0e1424',
            color: '#f1f3fa',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'var(--ui)',
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: '0 14px 40px rgba(14,22,42,0.28)',
            animation: 'msgIn .25s ease',
          }}
        >
          <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
            <IconCheck size={15} />
          </span>
          {toast}
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="Feed" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['comfortable', 'compact']}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakToggle label="Detail panel" value={t.detailPanel} onChange={(v) => setTweak('detailPanel', v)} />
        <TweakSection label="Identity" />
        <TweakToggle label="Source brand accents" value={t.accents} onChange={(v) => setTweak('accents', v)} />
        <TweakSection label="Atmosphere" />
        <TweakColorHue value={t.glowHue} onChange={(v) => setTweak('glowHue', v)} />
      </TweaksPanel>
    </div>
  );
}
