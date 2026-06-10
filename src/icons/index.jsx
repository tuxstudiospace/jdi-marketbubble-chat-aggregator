import React from 'react';

export const Icon = ({ d, size = 18, sw = 1.6, fill = 'none', children, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-3.6-3.6" />
  </Icon>
);
export const IconBolt = (p) => <Icon {...p} d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" />;
export const IconPause = (p) => (
  <Icon {...p}>
    <rect x="6.5" y="5" width="3.4" height="14" rx="1.2" />
    <rect x="14.1" y="5" width="3.4" height="14" rx="1.2" />
  </Icon>
);
export const IconPlay = (p) => (
  <Icon {...p}>
    <path d="M7 5.5l11 6.5-11 6.5v-13Z" />
  </Icon>
);
export const IconReply = (p) => (
  <Icon {...p}>
    <path d="M9 7L4 11.5 9 16" />
    <path d="M4 11.5h9.5a5.5 5.5 0 0 1 5.5 5.5V19" />
  </Icon>
);
export const IconPin = (p) => (
  <Icon {...p}>
    <path d="M9 3.5h6l-1 5 3 3v2H7v-2l3-3-1-5Z" />
    <path d="M12 13.5V21" />
  </Icon>
);
export const IconHide = (p) => (
  <Icon {...p}>
    <path d="M3 12s3.5-6.5 9-6.5 9 6.5 9 6.5-3.5 6.5-9 6.5S3 12 3 12Z" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M4 4l16 16" />
  </Icon>
);
export const IconStar = (p) => (
  <Icon {...p}>
    <path d="M12 4l2.3 4.9 5.2.6-3.9 3.6 1.1 5.2L12 16.2 7.2 18.9l1.1-5.2L4.4 10l5.2-.6L12 4Z" />
  </Icon>
);
export const IconExternal = (p) => (
  <Icon {...p}>
    <path d="M14 5h5v5" />
    <path d="M19 5l-8 8" />
    <path d="M18 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H11" />
  </Icon>
);
export const IconHeart = (p) => (
  <Icon {...p}>
    <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7-2.2c0 4.8-7 9.2-7 9.2Z" />
  </Icon>
);
export const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const IconClose = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 6.5" />
  </Icon>
);
export const IconAlert = (p) => (
  <Icon {...p}>
    <path d="M12 4.5l8.5 14.5H3.5L12 4.5Z" />
    <path d="M12 10v4" />
    <path d="M12 16.6v.1" />
  </Icon>
);
export const IconPlug = (p) => (
  <Icon {...p}>
    <path d="M9 3v5M15 3v5" />
    <path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8Z" />
    <path d="M12 16.5V21" />
  </Icon>
);
export const IconSliders = (p) => (
  <Icon {...p}>
    <path d="M4 8h10M18 8h2" />
    <path d="M4 16h4M12 16h8" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="10" cy="16" r="2" />
  </Icon>
);
export const IconChevron = (p) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
export const IconDot = ({ size = 8, color = 'currentColor' }) => (
  <span
    style={{ width: size, height: size, borderRadius: 9999, background: color, display: 'inline-block' }}
  />
);
export const IconTrash = (p) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M10 4h4l1 3H9l1-3Z" />
    <path d="M6 7l1 12.5A2 2 0 0 0 9 21h6a2 2 0 0 0 2-1.5L18 7" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);
