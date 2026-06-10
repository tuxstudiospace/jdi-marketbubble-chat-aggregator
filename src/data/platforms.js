// Platform identities — brand color used ONLY as a small accent dot / glyph tint.
// Glyph functions return monoline SVG strings that scale with size + color.

export const PLATFORMS = {
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    brand: '#9146FF',
    glyph: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
      `<path d="M4 3.5h15.5v10.2l-4 4h-3.4L9.4 20.5H7v-2.8H3.2V6.3L4 3.5Z" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M10.4 8v4M14.6 8v4" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>` +
      `</svg>`,
  },
  x: {
    id: 'x',
    name: 'X',
    brand: '#e5e5e5',
    glyph: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
      `<path d="M5 4.5l14 15M19 4.5l-14 15" stroke="${color}" stroke-width="1.7" stroke-linecap="round"/>` +
      `</svg>`,
  },
  kick: {
    id: 'kick',
    name: 'Kick',
    brand: '#53FC18',
    glyph: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
      `<path d="M6.5 4v16M6.5 12l6-6M6.5 12l6 6" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M14 6h3v3M14 18h3v-3" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</svg>`,
  },
};

export const SOURCE_IDS = ['twitch', 'x', 'kick'];
