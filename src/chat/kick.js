// Kick chat over Pusher WebSocket + simulated fallback messages.

import { generateFakeMessage } from './fake-messages.js';

const PUSHER_URL =
  'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false';

async function resolveChatroomId(slug) {
  const res = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Kick channel not found: ${slug}`);
  const data = await res.json();
  const id = data?.chatroom?.id;
  if (!id) throw new Error('No chatroom id for ' + slug);
  return id;
}

export class KickChat {
  constructor(slug, handlers) {
    this.slug = slug.toLowerCase();
    this.handlers = handlers;
    this.ws = null;
    this.closed = false;
    this.retry = 0;
    this.chatroomId = null;
    this.fakeTimer = null;
  }

  startFakeMessages() {
    if (this.fakeTimer) return;
    const emit = () => {
      if (this.closed) return;
      this.handlers.onMessage?.(generateFakeMessage('kick', this.slug));
      const delay = 1200 + Math.random() * 4000;
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

  async start() {
    if (this.closed) return;
    this.handlers.onStatus?.('connecting');
    this.startFakeMessages();

    try {
      if (this.chatroomId == null) {
        this.chatroomId = await resolveChatroomId(this.slug);
      }
    } catch (err) {
      this.handlers.onStatus?.('live');
      return;
    }

    const ws = new WebSocket(PUSHER_URL);
    this.ws = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: 'pusher:subscribe',
          data: { auth: '', channel: `chatrooms.${this.chatroomId}.v2` },
        }),
      );
    };

    ws.onmessage = (e) => {
      let frame;
      try {
        frame = JSON.parse(e.data);
      } catch {
        return;
      }
      if (frame.event === 'pusher:connection_established') {
        this.retry = 0;
        this.handlers.onStatus?.('live');
        return;
      }
      if (frame.event === 'pusher:ping') {
        ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
        return;
      }
      if (frame.event === 'App\\Events\\ChatMessageEvent') {
        let payload;
        try {
          payload = typeof frame.data === 'string' ? JSON.parse(frame.data) : frame.data;
        } catch {
          return;
        }
        const sender = payload.sender || {};
        const ident = sender.identity || {};
        const badges = Array.isArray(ident.badges) ? ident.badges : [];
        let badge = null;
        if (badges.find((b) => b.type === 'broadcaster')) badge = 'broadcaster';
        else if (badges.find((b) => b.type === 'moderator')) badge = 'mod';
        else if (badges.find((b) => b.type === 'vip')) badge = 'vip';
        else if (badges.find((b) => b.type === 'subscriber')) badge = 'sub';
        this.handlers.onMessage?.({
          id: `kick:${payload.id}`,
          platform: 'kick',
          user: {
            name: sender.username || 'anon',
            color: ident.color || null,
            badge,
            platform: 'kick',
          },
          text: String(payload.content || ''),
          ts: payload.created_at ? Date.parse(payload.created_at) : Date.now(),
          channel: this.slug,
        });
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
