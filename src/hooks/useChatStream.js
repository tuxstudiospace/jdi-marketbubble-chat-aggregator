import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ChatHub } from '../chat/index.js';

const MAX_MESSAGES = 200;

export function useChatStream(channels, { paused }) {
  const hubRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [statuses, setStatuses] = useState({}); // { 'twitch:xqc': 'live', ... }

  if (!hubRef.current) hubRef.current = new ChatHub();
  const hub = hubRef.current;

  useEffect(() => () => hub.dispose(), [hub]);

  useEffect(() => {
    const offMsg = hub.on('message', (m) => {
      setMessages((prev) => {
        // de-dupe by id (Twitch can echo on reconnect race)
        if (prev.length && prev[prev.length - 1].id === m.id) return prev;
        const next = prev.concat(m);
        return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      });
    });
    const offStatus = hub.on('status', ({ source, channel, status }) => {
      setStatuses((prev) => ({ ...prev, [`${source}:${channel}`]: status }));
    });
    return () => {
      offMsg();
      offStatus();
    };
  }, [hub]);

  // Reconcile desired channels (from localStorage) with active connections.
  useEffect(() => {
    if (paused) {
      // Disconnect everything when paused.
      for (const source of Object.keys(channels)) {
        for (const ch of hub.list(source)) hub.remove(source, ch);
      }
      return;
    }
    for (const source of Object.keys(channels)) {
      const desired = new Set((channels[source] || []).map((c) => c.toLowerCase()));
      const current = new Set(hub.list(source));
      for (const ch of desired) if (!current.has(ch)) hub.add(source, ch);
      for (const ch of current) if (!desired.has(ch)) hub.remove(source, ch);
    }
  }, [channels, paused, hub]);

  // Per-source aggregated status: 'live' if any channel live, 'connecting'
  // if any connecting, 'error' if all errored, otherwise 'idle'.
  const sourceStatus = useMemo(() => {
    const out = {};
    for (const source of ['twitch', 'kick', 'x']) {
      const channelsForSource = (channels[source] || []).map((c) => c.toLowerCase());
      if (channelsForSource.length === 0) {
        out[source] = 'idle';
        continue;
      }
      const states = channelsForSource.map((ch) => statuses[`${source}:${ch}`] || 'connecting');
      if (states.some((s) => s === 'live' || s === 'connected')) out[source] = 'live';
      else if (states.some((s) => s === 'connecting' || s === 'syncing')) out[source] = 'connecting';
      else if (states.every((s) => s === 'error')) out[source] = 'error';
      else out[source] = 'disconnected';
    }
    return out;
  }, [channels, statuses]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, statuses, sourceStatus, clearMessages };
}
