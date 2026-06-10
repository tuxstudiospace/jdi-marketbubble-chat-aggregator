import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../icons/index.jsx';

export function FloatingCard({
  title,
  children,
  defaultX,
  defaultY,
  defaultW,
  defaultH,
  minW = 320,
  minH = 200,
  zIndex = 10,
  onFocus,
  storageKey,
}) {
  const saved = storageKey ? (() => {
    try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
  })() : null;

  const [pos, setPos] = useState({
    x: saved?.x ?? defaultX,
    y: saved?.y ?? defaultY,
    w: saved?.w ?? defaultW,
    h: saved?.h ?? defaultH,
  });
  const [maximized, setMaximized] = useState(false);
  const [preMax, setPreMax] = useState(null);
  const dragging = useRef(null);
  const resizing = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(pos)); } catch {}
    }
  }, [pos, storageKey]);

  const onDragStart = useCallback((e) => {
    if (maximized) return;
    e.preventDefault();
    onFocus?.();
    const startX = (e.touches ? e.touches[0].clientX : e.clientX) - pos.x;
    const startY = (e.touches ? e.touches[0].clientY : e.clientY) - pos.y;
    dragging.current = { startX, startY };

    document.body.classList.add('dragging');
    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      setPos((p) => ({ ...p, x: cx - startX, y: Math.max(0, cy - startY) }));
    };
    const onUp = () => {
      dragging.current = null;
      document.body.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [pos.x, pos.y, maximized, onFocus]);

  const onResizeStart = useCallback((e) => {
    if (maximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const startW = pos.w;
    const startH = pos.h;
    resizing.current = true;
    document.body.classList.add('dragging');

    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      setPos((p) => ({
        ...p,
        w: Math.max(minW, startW + (cx - startX)),
        h: Math.max(minH, startH + (cy - startY)),
      }));
    };
    const onUp = () => {
      resizing.current = null;
      document.body.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  }, [pos.w, pos.h, minW, minH, maximized, onFocus]);

  const toggleMax = () => {
    if (maximized) {
      if (preMax) setPos(preMax);
      setMaximized(false);
    } else {
      setPreMax({ ...pos });
      setPos({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight });
      setMaximized(true);
    }
  };

  const style = maximized
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: zIndex + 1000 }
    : { position: 'fixed', left: pos.x, top: pos.y, width: pos.w, height: pos.h, zIndex };

  return (
    <div
      ref={cardRef}
      onMouseDown={() => onFocus?.()}
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: maximized ? 0 : 20,
        overflow: 'hidden',
        background: '#14182c',
        border: maximized ? 'none' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: maximized
          ? 'none'
          : '0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
        transition: maximized ? 'all .25s cubic-bezier(.2,.8,.3,1)' : 'none',
      }}
    >
      {/* Title bar — drag handle */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        onDoubleClick={toggleMax}
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          height: 40,
          background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          cursor: maximized ? 'default' : 'grab',
          userSelect: 'none',
        }}
      >
        {/* Drag dots indicator */}
        <span style={{ display: 'flex', gap: 3, opacity: 0.35 }}>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: '#a2aabe' }} />
          <span style={{ width: 4, height: 4, borderRadius: 2, background: '#a2aabe' }} />
          <span style={{ width: 4, height: 4, borderRadius: 2, background: '#a2aabe' }} />
        </span>
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--ui)',
            fontSize: 13,
            fontWeight: 600,
            color: '#f0f3fb',
            letterSpacing: '-0.005em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        {/* Maximize / restore button */}
        <button
          onClick={toggleMax}
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            border: 'none',
            background: 'transparent',
            color: '#a2aabe',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title={maximized ? 'Restore' : 'Maximize'}
        >
          <Icon size={14}>
            {maximized
              ? <path d="M4 8h8v8H4zM8 4h8v8" />
              : <path d="M4 4h16v16H4z" />
            }
          </Icon>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Resize handle (bottom-right corner) */}
      {!maximized && (
        <div
          onMouseDown={onResizeStart}
          onTouchStart={onResizeStart}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 20,
            height: 20,
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 3,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: 0.3 }}>
            <path d="M9 1v8H1" fill="none" stroke="#a2aabe" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 5v4H5" fill="none" stroke="#a2aabe" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
