import React, { useState } from 'react';
import { IconPlus, IconTrash } from '../icons/index.jsx';

const PLACEHOLDER = {
  twitch: 'twitch channel (e.g. xqc)',
  kick: 'kick slug (e.g. adin)',
  x: 'x handle (e.g. nasa)',
};

export function ChannelPicker({ source, channels, onAdd, onRemove }) {
  const [val, setVal] = useState('');

  const submit = (e) => {
    e?.preventDefault?.();
    const v = val.trim().replace(/^@/, '').replace(/^#/, '').toLowerCase();
    if (!v) return;
    if (!channels.includes(v)) onAdd(v);
    setVal('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <form onSubmit={submit} style={{ display: 'flex', gap: 6 }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={PLACEHOLDER[source] || 'channel'}
          style={{
            flex: 1,
            minWidth: 0,
            height: 28,
            padding: '0 9px',
            borderRadius: 8,
            border: '1px solid rgba(14,22,42,0.12)',
            background: 'rgba(255,255,255,0.7)',
            color: '#0e1424',
            fontFamily: 'var(--ui)',
            fontSize: 12.5,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          aria-label={`Add ${source} channel`}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid rgba(14,22,42,0.12)',
            background: '#0e1424',
            color: '#f1f3fa',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <IconPlus size={14} />
        </button>
      </form>
      {channels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {channels.map((c) => (
            <span
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                height: 22,
                padding: '0 6px 0 9px',
                borderRadius: 9999,
                background: 'rgba(14,22,42,0.06)',
                color: '#0e1424',
                fontFamily: 'var(--ui)',
                fontSize: 11.5,
                fontWeight: 500,
              }}
            >
              {c}
              <button
                onClick={() => onRemove(c)}
                aria-label={`Remove ${c}`}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 6,
                  background: 'transparent',
                  border: 'none',
                  color: '#7a8294',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <IconTrash size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
