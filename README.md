# Unified Chat Aggregator

A live, unified chat dashboard pulling **Twitch**, **X**, and **Kick** into a single feed — no backend, no API keys, no OAuth.

- **Twitch** — anonymous IRC over WebSocket (`wss://irc-ws.chat.twitch.tv`)
- **Kick** — public Pusher WebSocket
- **X** — public syndication endpoint, polled every 30s (posts feed, since X has no public chat)

## Run

```
npm install
npm run dev
```

Open http://localhost:5173, click **Add** under any source in the sidebar, and type a channel/handle (e.g. Twitch: `xqc`, Kick: `adin`, X: `nasa`).

## Build

```
npm run build
npm run preview
```

Outputs a static `dist/` deployable to any static host (Netlify, Vercel, GitHub Pages, etc.).
