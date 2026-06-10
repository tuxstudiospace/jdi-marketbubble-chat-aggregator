// Platform identities — brand color used ONLY as a small accent dot / glyph tint.
// Glyph functions return monoline SVG strings that scale with size + color.

export const PLATFORMS = {
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    brand: '#9146FF',
    glyph: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 256 268" aria-hidden="true">` +
      `<path d="M17.46 0L0 46.56v185.2h63.14v35.78h35.78L134.7 231.8h53.36L256 163.9V0H17.46zm23.14 23.1h192.3v128.7l-42.24 42.2h-63.1L92 229.6v-35.6H40.6V23.1z" fill="${color}"/>` +
      `<path d="M195.6 69.3h-23.1v69.3h23.1V69.3zm-63.1 0H109.4v69.3h23.1V69.3z" fill="${color}"/>` +
      `</svg>`,
  },
  x: {
    id: 'x',
    name: 'X',
    brand: '#e5e5e5',
    glyph: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">` +
      `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="${color}"/>` +
      `</svg>`,
  },
  kick: {
    id: 'kick',
    name: 'Kick',
    brand: '#53FC18',
    glyph: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 96 96" aria-hidden="true">` +
      `<path d="M0 0h32v32H0zm0 32h32v32H0zm0 32h32v32H0zm32 0h32v32H32zm32-32h32v32H64zm32-32h32v32H64zM32 0h32v32H32zm32 32h32v32H64z" fill="${color}"/>` +
      `</svg>`,
  },
};

export const SOURCE_IDS = ['twitch', 'x', 'kick'];
