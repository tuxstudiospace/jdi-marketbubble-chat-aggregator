// X (Twitter) posts feed via the public syndication endpoint.
//
// X has NO public chat API, so this is a posts-feed: we poll the same
// JSON the official tweet-embed widget uses (no auth, CORS-open) and emit
// new posts from a handle into the unified feed as messages with kind:'post'.

const POLL_MS = 30_000;

async function fetchTimeline(handle) {
  const url = `https://cdn.syndication.twimg.com/timeline/profile?screen_name=${encodeURIComponent(
    handle,
  )}&suppress_response_codes=true`;
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`X syndication ${res.status}`);
  return res.json();
}

function extractTweets(payload) {
  // The syndication endpoint returns either { body: [...] } or a richer object
  // with body containing tweet entries. Both shapes are handled defensively.
  const list = Array.isArray(payload?.body) ? payload.body : [];
  return list
    .map((entry) => entry?.tweet || entry?.item?.itemContent?.tweet_results?.result || entry)
    .filter((t) => t && (t.id_str || t.id) && (t.full_text || t.text))
    .map((t) => ({
      id: String(t.id_str || t.id),
      text: String(t.full_text || t.text || ''),
      ts: t.created_at ? Date.parse(t.created_at) : Date.now(),
      user: t.user || t.core?.user_results?.result?.legacy || {},
    }));
}

export class XPosts {
  constructor(handle, handlers) {
    this.handle = handle.replace(/^@/, '').toLowerCase();
    this.handlers = handlers;
    this.timer = null;
    this.closed = false;
    this.seen = new Set();
    this.firstFetch = true;
    this.retry = 0;
  }

  async tick() {
    if (this.closed) return;
    try {
      const payload = await fetchTimeline(this.handle);
      const tweets = extractTweets(payload);
      this.retry = 0;
      if (this.firstFetch) {
        // On first load, mark existing tweets as seen and surface the most
        // recent 5 immediately so the feed isn't empty for slow accounts.
        const recent = tweets
          .filter((t) => !this.seen.has(t.id))
          .sort((a, b) => b.ts - a.ts)
          .slice(0, 5)
          .reverse();
        for (const t of tweets) this.seen.add(t.id);
        for (const t of recent) this.emit(t);
        this.firstFetch = false;
        this.handlers.onStatus?.('live');
        return;
      }
      let any = false;
      const fresh = tweets
        .filter((t) => !this.seen.has(t.id))
        .sort((a, b) => a.ts - b.ts);
      for (const t of fresh) {
        this.seen.add(t.id);
        this.emit(t);
        any = true;
      }
      if (any || tweets.length > 0) this.handlers.onStatus?.('live');
    } catch {
      this.handlers.onStatus?.('error');
      this.retry++;
    }
  }

  emit(t) {
    const u = t.user || {};
    const name = u.name || u.screen_name || this.handle;
    const screen = u.screen_name || this.handle;
    const avatar = (u.profile_image_url_https || u.profile_image_url || '').replace(
      '_normal',
      '_x96',
    );
    const verified = !!(u.verified || u.is_blue_verified);
    this.handlers.onMessage?.({
      id: `x:${t.id}`,
      platform: 'x',
      kind: 'post',
      user: {
        name,
        screen,
        avatar,
        badge: verified ? 'verified' : null,
        platform: 'x',
      },
      text: t.text,
      ts: t.ts || Date.now(),
      channel: this.handle,
    });
  }

  start() {
    if (this.closed) return;
    this.handlers.onStatus?.('connecting');
    this.tick();
    this.timer = setInterval(() => this.tick(), POLL_MS);
  }

  stop() {
    this.closed = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
