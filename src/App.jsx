import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { FeedMessage } from './feed/FeedMessage.jsx';
import { LoadingState, EmptyState, DisconnectedState, ErrorState } from './feed/EdgeStates.jsx';
import { PlatformGlyph } from './components/Avatar.jsx';
import { RightPanel } from './panels/RightPanel.jsx';
// import { DevSwitcher } from './panels/DevSwitcher.jsx';
import { VideoPanel } from './components/VideoPanel.jsx';
import { FloatingCard } from './components/FloatingCard.jsx';
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
  darkMode: false,
  theme: 'default',
};

const DEFAULT_CHANNELS = {
  twitch: ['fazebanks'],
  x: ['Banks', 'blknoiz06', 'MarketBubble'],
  kick: ['ansem'],
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [channels, setChannels] = useLocalStorage('uca:channels:v5', DEFAULT_CHANNELS);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [unread, setUnread] = useState({ twitch: 0, x: 0, kick: 0 });
  const [previewState, setPreviewState] = useState(null); // null = live mode
  const [toast, setToast] = useState(null);
  const [showVideo, setShowVideo] = useLocalStorage('uca:showVideo', true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const isMobile = winW <= 768;
  const [topCard, setTopCard] = useState('feed');
  const [topZ, setTopZ] = useState(12);
  const [fakeViewers, setFakeViewers] = useState(12400);
  const bringToFront = (card) => { setTopCard(card); setTopZ((z) => z + 1); };

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
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--glow-hue', t.glowHue);
  }, [t.glowHue]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', t.darkMode);
  }, [t.darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('wsj', t.theme === 'wsj');
  }, [t.theme]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFakeViewers((v) => Math.max(8000, v + Math.floor((Math.random() - 0.48) * 300)));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, compact, previewState]);

  const onScroll = useCallback((e) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickRef.current = isAtBottom;
    setAtBottom(isAtBottom);
  }, []);

  const jumpToPresent = useCallback(() => {
    const el = feedRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      stickRef.current = true;
      setAtBottom(true);
    }
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
      {isMobile ? (
        sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
            <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
              <Sidebar
                sources={sources}
                filter={filter}
                onFilter={(f) => { selectFilter(f); setSidebarOpen(false); }}
                accent={t.accents}
                counts={unread}
                totalUnread={totalUnread}
                channels={channels}
                onAddChannel={addChannel}
                onRemoveChannel={removeChannel}
                onTweaksToggle={() => setTweaksOpen((o) => !o)}
                darkMode={t.darkMode}
                theme={t.theme}
                mobile
              />
            </div>
          </div>
        )
      ) : (
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
          onTweaksToggle={() => setTweaksOpen((o) => !o)}
          darkMode={t.darkMode}
          theme={t.theme}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      )}

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
          viewers={new Set(messages.map((m) => m.user.name)).size}
          viewerCount={fakeViewers.toLocaleString()}
          connectedCount={connectedCount}
          accent={t.accents}
          mobile={isMobile}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          darkMode={t.darkMode}
          theme={t.theme}
        />

        {isMobile ? (
          <>
            {showVideo && <VideoPanel channels={channels} accent={t.accents} mobile />}
            <FeedPanel
              feedRef={feedRef}
              onScroll={onScroll}
              filter={filter}
              onFilter={selectFilter}
              sources={sources}
              filtered={filtered}
              paused={paused}
              connectedCount={connectedCount}
              showVideo={showVideo}
              setShowVideo={setShowVideo}
              clearMessages={clearMessages}
              messages={messages}
              overlayState={overlayState}
              showOverlay={showOverlay}
              hasAnyChannels={hasAnyChannels}
              reconnect={reconnect}
              compact={compact}
              now={now}
              accent={t.accents}
              selected={selected}
              setSelected={setSelected}
              newSet={newSet}
              onAction={onAction}
              atBottom={atBottom}
              jumpToPresent={jumpToPresent}
              isMobile
              style={{ flex: 1, minHeight: 0, margin: '0 8px 8px', borderRadius: 18 }}
            />
          </>
        ) : (
          <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', gap: 16, padding: 16, overflow: 'hidden' }}>
            {showVideo && (
              <FloatingCard
                title="Live Stream"
                defaultX={330}
                defaultY={160}
                defaultW={660}
                defaultH={480}
                minW={360}
                minH={260}
                zIndex={topCard === 'video' ? topZ : 10}
                onFocus={() => bringToFront('video')}
                storageKey="uca:card:video5"
                pinnedStyle={{ flex: '1.5 1 0%' }}
              >
                <VideoPanel channels={channels} accent={t.accents} embedded />
              </FloatingCard>
            )}
            <FloatingCard
              title={filter === 'all' ? 'My Feed' : `${PLATFORMS[filter]?.name || filter} Feed`}
              defaultX={1010}
              defaultY={160}
              defaultW={420}
              defaultH={540}
              minW={320}
              minH={280}
              zIndex={topCard === 'feed' ? topZ : 10}
              onFocus={() => bringToFront('feed')}
              storageKey="uca:card:feed5"
              pinnedStyle={{ flex: '1 1 0%' }}
            >
              <FeedPanelInner
                feedRef={feedRef}
                onScroll={onScroll}
                filter={filter}
                onFilter={selectFilter}
                sources={sources}
                filtered={filtered}
                paused={paused}
                connectedCount={connectedCount}
                showVideo={showVideo}
                setShowVideo={setShowVideo}
                clearMessages={clearMessages}
                messages={messages}
                overlayState={overlayState}
                showOverlay={showOverlay}
                hasAnyChannels={hasAnyChannels}
                reconnect={reconnect}
                compact={compact}
                now={now}
                accent={t.accents}
                selected={selected}
                setSelected={setSelected}
                newSet={newSet}
                onAction={onAction}
                atBottom={atBottom}
                jumpToPresent={jumpToPresent}
              />
            </FloatingCard>
          </div>
        )}
      </main>

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

      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)}>
        <TweakSection label="Feed" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['comfortable', 'compact']}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakSection label="Identity" />
        <TweakToggle label="Source brand accents" value={t.accents} onChange={(v) => setTweak('accents', v)} />
        <TweakSection label="Atmosphere" />
        <TweakRadio
          label="Theme"
          value={t.theme}
          options={[
            { value: 'default', label: 'Default' },
            { value: 'wsj', label: 'WSJ' },
          ]}
          onChange={(v) => setTweak('theme', v)}
        />
        {t.theme === 'default' && <TweakToggle label="Dark mode" value={t.darkMode} onChange={(v) => setTweak('darkMode', v)} />}
        {t.theme === 'default' && <TweakColorHue value={t.glowHue} onChange={(v) => setTweak('glowHue', v)} />}
      </TweaksPanel>
    </div>
  );
}

function FeedHeaderBar({ filter, onFilter, sources, accent, filtered, paused, connectedCount, showVideo, setShowVideo, clearMessages, messages, isMobile }) {
  const chips = [{ id: 'all', name: 'All' }].concat((sources || []).map((s) => ({ id: s.id, name: PLATFORMS[s.id]?.name || s.id })));
  return (
    <div className="feed-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
      <div
        style={{
          padding: isMobile ? '12px 14px 10px' : '12px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 10,
        }}
      >
        <span style={{ fontFamily: 'var(--ui)', fontSize: 13, fontWeight: 700, color: '#f0f3fb' }}>
          {filter === 'all' ? 'Live Chat' : `${PLATFORMS[filter]?.name || filter} Chat`}
        </span>
        <span
          className="feed-count-badge"
          style={{
            minWidth: 24, height: 20, padding: '0 7px', borderRadius: 9999,
            background: 'var(--accent)', color: 'var(--accent-ink)',
            fontFamily: 'var(--ui)', fontSize: 11, fontWeight: 700,
            display: 'grid', placeItems: 'center',
          }}
        >
          {filtered.length}
        </span>
        <div style={{ flex: 1 }} />
        {!paused && connectedCount > 0 && (
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 24, padding: '0 10px', borderRadius: 9999,
              background: 'rgba(212,245,74,0.12)', border: '1px solid rgba(212,245,74,0.28)',
              color: 'var(--accent)', fontFamily: 'var(--ui)', fontSize: 11, fontWeight: 600,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: 'var(--accent)', animation: 'glowPulse 1.6s ease-in-out infinite' }} />
            LIVE
          </span>
        )}
        <button
          onClick={() => setShowVideo((v) => !v)}
          style={{
            height: 24, padding: '0 10px', borderRadius: 9999,
            background: showVideo ? 'rgba(212,245,74,0.12)' : 'rgba(255,255,255,0.05)',
            border: showVideo ? '1px solid rgba(212,245,74,0.28)' : '1px solid rgba(255,255,255,0.08)',
            color: showVideo ? 'var(--accent)' : '#b0b8cc',
            fontFamily: 'var(--ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showVideo ? 'Hide video' : 'Show video'}
        </button>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            style={{
              height: 24, padding: '0 10px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#b0b8cc', fontFamily: 'var(--ui)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>
      {onFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px 10px', overflowX: 'auto' }}>
          {chips.map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onFilter(c.id)}
                style={{
                  height: 28,
                  padding: c.id === 'all' ? '0 12px' : '0 11px 0 8px',
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#f0f3fb' : '#8a92a6',
                  fontFamily: 'var(--ui)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.id !== 'all' && <PlatformGlyph id={c.id} size={12} accent={accent} tone={active ? 'dark' : 'light'} />}
                {c.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeedScrollArea({ feedRef, onScroll, overlayState, showOverlay, hasAnyChannels, filter, reconnect, filtered, compact, now, accent, selected, setSelected, newSet, onAction, isMobile, atBottom, jumpToPresent }) {
  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
    <div
      ref={feedRef}
      onScroll={onScroll}
      style={{
        flex: 1,
        overflowY: showOverlay && overlayState !== 'empty' ? 'hidden' : 'auto',
        padding: showOverlay ? 0 : isMobile ? '6px 6px 10px' : '6px 8px 10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {overlayState === 'loading' && <LoadingState />}
      {overlayState === 'error' && <ErrorState name="Source" onRetry={reconnect} />}
      {overlayState === 'disconnected' && <DisconnectedState name="Source" onReconnect={reconnect} />}
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
                accent={accent}
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
    {!atBottom && filtered.length > 0 && (
      <button
        onClick={jumpToPresent}
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          height: 34,
          padding: '0 18px',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: '#0e1424',
          color: '#f1f3fa',
          border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'var(--ui)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'msgIn .2s ease',
          zIndex: 5,
          whiteSpace: 'nowrap',
        }}
        className="jump-to-present"
      >
        <span style={{ fontSize: 14 }}>↓</span> Jump to Present
      </button>
    )}
    </div>
  );
}

function ChatInputBar() {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ['😀','😂','🔥','❤️','👍','🎉','💀','😭','🤣','👀','💯','🙏'];
  return (
    <div className="chat-input-bar" style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      {showEmoji && (
        <div className="emoji-picker" style={{
          position: 'absolute', bottom: '100%', left: 12, marginBottom: 6,
          background: '#1c2132', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 4, width: 220,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 10,
        }}>
          {emojis.map((e) => (
            <button key={e} onClick={() => { setText((t) => t + e); setShowEmoji(false); }}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
            >{e}</button>
          ))}
        </div>
      )}
      <button
        className="chat-emoji-btn"
        onClick={() => setShowEmoji((o) => !o)}
        style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: '#a2aabe', display: 'grid', placeItems: 'center',
          cursor: 'pointer', flexShrink: 0, fontSize: 18,
        }}
      >☺</button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Send a message"
        onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) setText(''); }}
        style={{
          flex: 1, height: 38, padding: '0 14px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
          color: '#f0f3fb', fontFamily: 'var(--ui)', fontSize: 13.5, outline: 'none',
        }}
      />
      <button
        className="chat-send-btn"
        onClick={() => { if (text.trim()) setText(''); }}
        style={{
          height: 38, padding: '0 16px', borderRadius: 10, border: 'none',
          background: 'var(--accent)', color: 'var(--accent-ink)',
          fontFamily: 'var(--ui)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
        Send
      </button>
    </div>
  );
}

function FeedPanelInner(props) {
  return (
    <>
      <FeedHeaderBar {...props} />
      <FeedScrollArea {...props} />
      <ChatInputBar />
    </>
  );
}

function FeedPanel({ style, ...props }) {
  return (
    <div
      className="feed-panel"
      style={{
        background: '#14182c',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '0 22px 60px rgba(14,22,42,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <FeedPanelInner {...props} />
    </div>
  );
}
