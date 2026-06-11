import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PLATFORMS } from '../data/platforms.js';
import { PlatformGlyph } from './Avatar.jsx';

function embedUrl(source, channel) {
  if (source === 'twitch') {
    const parent = window.location.hostname || 'localhost';
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${parent}&muted=true&autoplay=true`;
  }
  if (source === 'kick') {
    return `https://player.kick.com/${encodeURIComponent(channel)}?muted=true&autoplay=true`;
  }
  return null;
}

function XLiveMockup({ channel }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;
    const draw = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      // dark gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0a0a12');
      grad.addColorStop(1, '#12141e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // animated chart line
      ctx.strokeStyle = '#1DA1F2';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#1DA1F2';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h * 0.5 + Math.sin(x * 0.012 + t) * h * 0.15 + Math.sin(x * 0.03 + t * 1.7) * h * 0.06;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // candle bars
      for (let i = 0; i < 18; i++) {
        const bx = w * 0.08 + i * (w * 0.05);
        const bh = 12 + Math.sin(i * 0.8 + t * 0.5) * 20;
        const by = h * 0.5 - bh / 2 + Math.sin(i * 0.5 + t) * h * 0.1;
        const green = Math.sin(i * 1.2 + t * 0.3) > 0;
        ctx.fillStyle = green ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)';
        ctx.fillRect(bx - 3, by, 6, Math.abs(bh));
        ctx.fillStyle = green ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
        ctx.fillRect(bx - 0.5, by - 5, 1, Math.abs(bh) + 10);
      }

      // X logo watermark
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('𝕏', w / 2, h / 2 + 16);

      // LIVE badge
      ctx.fillStyle = '#e53935';
      const bw = 52, bh2 = 22, bx2 = 14, by2 = 14;
      ctx.beginPath();
      ctx.roundRect(bx2, by2, bw, bh2, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('● LIVE', bx2 + 8, by2 + 15);

      // channel name
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`@${channel}`, 14, h - 14);

      raf = requestAnimationFrame(draw);
    };
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [channel]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

export function VideoPanel({ channels, accent, mobile, embedded }) {
  const streams = useMemo(() => {
    const out = [];
    for (const source of ['twitch', 'kick', 'x']) {
      for (const ch of channels[source] || []) out.push({ source, channel: ch });
    }
    return out;
  }, [channels]);

  const [activeKey, setActiveKey] = useState(null);

  if (streams.length === 0) return null;

  const active =
    streams.find((s) => `${s.source}:${s.channel}` === activeKey) || streams[0];
  const url = active.source !== 'x' ? embedUrl(active.source, active.channel) : null;
  const isX = active.source === 'x';

  const outerStyle = embedded
    ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: '#0c1020', overflow: 'hidden' }
    : {
        margin: mobile ? '0 8px 8px' : '0 22px 14px',
        borderRadius: mobile ? 18 : 28,
        background: '#0c1020',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 22px 60px rgba(14,22,42,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow: 'hidden',
        flexShrink: 0,
      };

  return (
    <div className="video-panel" style={outerStyle}>
      <div
        className="video-tabs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: embedded ? '8px 12px' : '12px 16px',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {streams.map((s) => {
          const key = `${s.source}:${s.channel}`;
          const isActive = key === `${active.source}:${active.channel}`;
          const brand = PLATFORMS[s.source]?.brand || '#888';
          return (
            <button
              className="video-tab"
              data-active={isActive ? 'true' : 'false'}
              key={key}
              onClick={() => setActiveKey(key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 28,
                padding: '0 12px',
                borderRadius: 9999,
                border: isActive
                  ? `1px solid ${accent ? brand : 'rgba(212,245,74,0.4)'}`
                  : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#f0f3fb' : '#a2aabe',
                fontFamily: 'var(--ui)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <PlatformGlyph id={s.source} size={12} accent={isActive} />
              {s.channel}
            </button>
          );
        })}
      </div>

      <div style={embedded
        ? { flex: 1, minHeight: 0, position: 'relative' }
        : { position: 'relative', width: '100%', aspectRatio: '16 / 9', maxHeight: '34vh' }
      }>
        {isX ? (
          <XLiveMockup channel={active.channel} />
        ) : (
          <iframe
            key={url}
            src={url}
            title={`${active.source} stream: ${active.channel}`}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        )}
      </div>
    </div>
  );
}
