import React, { useState } from 'react';
import { IconCheck, IconSliders } from '../icons/index.jsx';

const STATES = [
  ['connected', 'Connected'],
  ['empty', 'Empty'],
  ['loading', 'Loading'],
  ['disconnected', 'Disconnected'],
  ['error', 'Error'],
];

export function DevSwitcher({ state, onState }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', left: 18, bottom: 18, zIndex: 40, fontFamily: 'var(--ui)' }}>
      {open && (
        <div
          style={{
            marginBottom: 8,
            padding: 6,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 12px 36px rgba(14,22,42,0.16)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 200,
          }}
        >
          <div
            style={{
              padding: '8px 10px 5px',
              fontSize: 10.5,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#7a8294',
              fontWeight: 700,
            }}
          >
            Preview state
          </div>
          {STATES.map(([id, label]) => (
            <button
              key={id}
              onClick={() => onState(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 10px',
                borderRadius: 11,
                border: 'none',
                textAlign: 'left',
                background: state === id ? 'rgba(14,22,42,0.06)' : 'transparent',
                color: state === id ? '#0e1424' : '#3a4258',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 16,
                  display: 'grid',
                  placeItems: 'center',
                  color: state === id ? 'var(--accent-deep)' : 'transparent',
                }}
              >
                {state === id && <IconCheck size={14} />}
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 40,
          padding: '0 14px 0 13px',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          color: '#0e1424',
          boxShadow: '0 8px 24px rgba(14,22,42,0.14)',
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <IconSliders size={16} />
        States
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--accent-deep)' }} />
      </button>
    </div>
  );
}
