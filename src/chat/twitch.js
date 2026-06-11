// Anonymous Twitch IRC over WebSocket + simulated fallback messages.

import { generateFakeMessage } from './fake-messages.js';

const URL = 'wss://irc-ws.chat.twitch.tv:443';
let seq = 1;

function parseTags(raw) {
  const tags = {};
  if (!raw) return tags;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    tags[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return tags;
}

function parsePrivmsg(line) {
  let i = 0;
  let tagsRaw = '';
  if (line[0] === '@') {
    const sp = line.indexOf(' ');
    tagsRaw = line.slice(1, sp);
    i = sp + 1;
  }
  if (line[i] !== ':') return null;
  const prefixEnd = line.indexOf(' ', i);
  const prefix = line.slice(i + 1, prefixEnd);
  const nickEnd = prefix.indexOf('!');
  const nick = nickEnd > 0 ? prefix.slice(0, nickEnd) : prefix;
  const rest = line.slice(prefixEnd + 1);
  if (!rest.startsWith('PRIVMSG ')) return null;
  const colon = rest.indexOf(' :');
  if (colon < 0) return null;
  const channel = rest.slice(8, colon);
  const text = rest.slice(colon + 2);
  const tags = parseTags(tagsRaw);
  const display = tags['display-name'] || nick;
  const color = tags.color || null;
  let badge = null;
  const badgesStr = tags.badges || '';
  if (badgesStr.includes('broadcaster/')) badge = 'broadcaster';
  else if (badgesStr.includes('moderator/')) badge = 'mod';
  else if (badgesStr.includes('vip/')) badge = 'vip';
  else if (badgesStr.includes('subscriber/')) badge = 'sub';
  return {
    id: `twitch:${tags.id || seq++}`,
    platform: 'twitch',
    user: { name: display, color, badge, platform: 'twitch' },
    text,
    ts: tags['tmi-sent-ts'] ? Number(tags['tmi-sent-ts']) : Date.now(),
    channel,
  };
}

export class TwitchChat {
  constructor(channel, handlers) {
    this.channel = channel.toLowerCase();
    this.handlers = handlers;
    this.ws = null;
    this.closed = false;
    this.retry = 0;
    this.fakeTimer = null;
    this.gotRealMsg = false;
  }

  startFakeMessages() {
    if (this.fakeTimer) return;
    const emit = () => {
      if (this.closed) return;
      this.handlers.onMessage?.(generateFakeMessage('twitch', this.channel));
      const delay = 800 + Math.random() * 3200;
      this.fakeTimer = setTimeout(emit, delay);
    };
    emit();
  }

  stopFakeMessages() {
    if (this.fakeTimer) {
      clearTimeout(this.fakeTimer);
      this.fakeTimer = null;
    }
  }

  start() {
    if (this.closed) return;
    this.handlers.onStatus?.('connecting');
    this.startFakeMessages();

    const ws = new WebSocket(URL);
    this.ws = ws;

    ws.onopen = () => {
      this.retry = 0;
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      const nick = `justinfan${Math.floor(10000 + Math.random() * 89999)}`;
      ws.send(`NICK ${nick}`);
      ws.send(`JOIN #${this.channel}`);
      this.handlers.onStatus?.('live');
    };

    ws.onmessage = (e) => {
      const data = String(e.data);
      for (const line of data.split('\r\n')) {
        if (!line) continue;
        if (line.startsWith('PING')) {
          ws.send('PONG :tmi.twitch.tv');
          continue;
        }
        if (line.includes(' PRIVMSG ')) {
          const m = parsePrivmsg(line);
          if (m) {
            this.gotRealMsg = true;
            this.handlers.onMessage?.(m);
          }
        }
      }
    };

    ws.onerror = () => {
      this.handlers.onStatus?.('error');
    };

    ws.onclose = () => {
      this.ws = null;
      if (this.closed) return;
      this.handlers.onStatus?.('disconnected');
      const delay = Math.min(15000, 800 * 2 ** this.retry++);
      setTimeout(() => this.start(), delay);
    };
  }

  stop() {
    this.closed = true;
    this.stopFakeMessages();
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
  }
}
