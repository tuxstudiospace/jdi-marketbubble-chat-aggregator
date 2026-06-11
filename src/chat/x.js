// X (Twitter) simulated posts feed.
// The public syndication endpoint is unreliable, so we generate realistic
// simulated posts from configured handles to keep the feed populated.

const POSTS = {
  banks: [
    "market is looking crazy right now 🔥",
    "if you're not paying attention you're going to miss it",
    "this is just the beginning",
    "told y'all about this one weeks ago",
    "the bubble is real and we're riding it",
    "who else is watching these charts rn",
    "can't sleep when the market moves like this",
    "we called it. again.",
    "new all time high incoming 📈",
    "stay focused. stay patient.",
    "this pullback is healthy don't panic",
    "biggest opportunity of the year right here",
    "everyone's a genius in a bull market",
    "the smart money is already in",
    "patience pays. always has.",
    "LFG 🚀",
    "market doesn't care about your feelings",
    "zoom out. the trend is your friend.",
    "bears getting liquidated left and right",
    "the real ones know what's coming",
  ],
  blknoiz06: [
    "long here. invalidation below the low",
    "higher timeframe structure still bullish",
    "watching this level closely for a reaction",
    "clean break and retest. textbook.",
    "this is the level I was talking about",
    "daily close above here and we send it",
    "bid filled. now we wait.",
    "ranges resolve. patience.",
    "this is where the real move starts",
    "if you sold here I can't help you",
    "market structure shift on the 4h",
    "reclaimed the key level. bulls in control",
    "still think we see a sweep before the move",
    "this consolidation is setting up something big",
    "levels are levels. respect the chart.",
    "weekly candle looking strong",
    "building a position here",
    "everyone bearish = time to pay attention",
    "the chart doesn't lie",
    "accumulation phase. be patient.",
  ],
  marketbubble: [
    "Market Bubble Live - tune in now 🫧",
    "the chat is going crazy right now",
    "live stream starting in 5 minutes",
    "who's watching tonight? drop a 🫧 in chat",
    "new episode dropping tomorrow",
    "the market never sleeps and neither do we",
    "tonight's stream was insane. VOD coming soon.",
    "follow @Banks @blknoiz06 for the best alpha",
    "Market Bubble community is the best on the internet",
    "we're live! link in bio 🔴",
    "clip that. absolute banger call.",
    "the vibes in chat tonight are unmatched",
    "this is what we do every single day",
    "thank you for 50k viewers tonight 🫧",
    "stream recap thread coming soon",
    "the bubble keeps growing 📈🫧",
    "don't miss tomorrow's show. big guests.",
    "community portfolio up 40% this month",
    "we eat dips for breakfast",
    "live in 10. don't be late.",
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class XPosts {
  constructor(handle, handlers) {
    this.handle = handle.replace(/^@/, '').toLowerCase();
    this.handlers = handlers;
    this.timer = null;
    this.closed = false;
    this.counter = 0;
  }

  emit(text) {
    const names = { banks: 'Banks', blknoiz06: 'blknoiz06', marketbubble: 'MarketBubble' };
    const name = names[this.handle] || this.handle;
    this.counter++;
    this.handlers.onMessage?.({
      id: `x:${this.handle}:${Date.now()}:${this.counter}`,
      platform: 'x',
      kind: 'post',
      user: {
        name,
        screen: this.handle,
        badge: 'verified',
        platform: 'x',
      },
      text,
      ts: Date.now(),
      channel: this.handle,
    });
  }

  start() {
    if (this.closed) return;
    this.handlers.onStatus?.('connecting');

    const pool = POSTS[this.handle];
    if (!pool) {
      this.handlers.onStatus?.('live');
      return;
    }

    setTimeout(() => {
      if (this.closed) return;
      this.emit(pickRandom(pool));
      this.handlers.onStatus?.('live');
    }, 800 + Math.random() * 1200);

    setTimeout(() => {
      if (this.closed) return;
      this.emit(pickRandom(pool));
    }, 2500 + Math.random() * 1500);

    const scheduleNext = () => {
      if (this.closed) return;
      const delay = 12000 + Math.random() * 13000;
      this.timer = setTimeout(() => {
        if (this.closed) return;
        this.emit(pickRandom(pool));
        scheduleNext();
      }, delay);
    };
    setTimeout(scheduleNext, 5000);
  }

  stop() {
    this.closed = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
