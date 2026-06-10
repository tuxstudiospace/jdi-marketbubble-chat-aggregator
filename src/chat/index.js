// ChatHub — unified subscribe/unsubscribe API across Twitch / Kick / X.
//
// Per-source connection lifecycle is managed here; consumers (the React
// useChatStream hook) just call add/remove and listen on 'message' / 'status'.

import { TwitchChat } from './twitch.js';
import { KickChat } from './kick.js';
import { XPosts } from './x.js';

const CTORS = {
  twitch: TwitchChat,
  kick: KickChat,
  x: XPosts,
};

export class ChatHub {
  constructor() {
    this.conns = new Map(); // key "source:channel" -> client
    this.listeners = { message: new Set(), status: new Set() };
  }

  key(source, channel) {
    return `${source}:${channel.toLowerCase()}`;
  }

  add(source, channel) {
    const Ctor = CTORS[source];
    if (!Ctor) return;
    const k = this.key(source, channel);
    if (this.conns.has(k)) return;
    const client = new Ctor(channel, {
      onMessage: (m) => this.emit('message', m),
      onStatus: (status) => this.emit('status', { source, channel: channel.toLowerCase(), status }),
    });
    this.conns.set(k, client);
    client.start();
  }

  remove(source, channel) {
    const k = this.key(source, channel);
    const c = this.conns.get(k);
    if (!c) return;
    c.stop();
    this.conns.delete(k);
    this.emit('status', { source, channel: channel.toLowerCase(), status: 'idle' });
  }

  list(source) {
    const out = [];
    for (const [k] of this.conns) {
      const [s, ...rest] = k.split(':');
      if (s === source) out.push(rest.join(':'));
    }
    return out;
  }

  on(event, fn) {
    this.listeners[event]?.add(fn);
    return () => this.listeners[event]?.delete(fn);
  }

  emit(event, payload) {
    const set = this.listeners[event];
    if (!set) return;
    for (const fn of set) {
      try {
        fn(payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('chat-hub listener', err);
      }
    }
  }

  dispose() {
    for (const c of this.conns.values()) c.stop();
    this.conns.clear();
    this.listeners.message.clear();
    this.listeners.status.clear();
  }
}
