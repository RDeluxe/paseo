import { useSyncExternalStore } from "react";
import { subscribeToRelativeTimeTick } from "@/utils/relative-time-ticker";

const HOUR_MS = 60 * 60_000;

/**
 * The instant "finished long ago" is measured against, floored to the hour.
 *
 * Every surface that applies the cutoff reads this one value — the project block for its rows,
 * the projection for its keyboard shortcuts — so they always agree on which workspaces sit behind
 * "More". Two `Date.now()` calls in two memos would drift apart as soon as one recomputed without
 * the other, and a shortcut would land on a hidden row.
 */
export function staleClockAt(now: number): number {
  return now - (now % HOUR_MS);
}

/**
 * Held here and moved only by `refreshStaleClock`, never on read. React reads a snapshot on every
 * render; if reading recomputed it, whichever reader re-rendered first after the hour turned would
 * see the new hour while the other kept the old one until the next tick.
 */
let staleClock = staleClockAt(Date.now());
const listeners = new Set<() => void>();
let stopTicking: (() => void) | null = null;

function refreshStaleClock(): void {
  const next = staleClockAt(Date.now());
  if (next === staleClock) return;
  staleClock = next;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToStaleClock(listener: () => void): () => void {
  listeners.add(listener);
  if (stopTicking === null) {
    // The value may have sat unread for hours; catch up before the first tick.
    refreshStaleClock();
    stopTicking = subscribeToRelativeTimeTick("hour", refreshStaleClock);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0 || stopTicking === null) return;
    stopTicking();
    stopTicking = null;
  };
}

export function readStaleClock(): number {
  return staleClock;
}

/**
 * The shared stale clock. It rides the relative-time ticker's hour tier, so a workspace that
 * crosses the cutoff while the app is open goes behind "More" within the hour — invisible on a
 * cutoff counted in days — and the sidebar re-renders once an hour at most for it.
 */
export function useStaleClock(): number {
  return useSyncExternalStore(subscribeToStaleClock, readStaleClock, readStaleClock);
}
