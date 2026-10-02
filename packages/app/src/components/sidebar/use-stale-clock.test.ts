import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readStaleClock, staleClockAt, subscribeToStaleClock } from "./use-stale-clock";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

describe("staleClockAt", () => {
  const hour = Date.UTC(2026, 9, 5, 14);

  it("gives every reader in the same hour the same instant", () => {
    expect(staleClockAt(hour + 1)).toBe(hour);
    expect(staleClockAt(hour + 59 * MINUTE)).toBe(hour);
  });

  it("moves when the hour turns", () => {
    expect(staleClockAt(hour + HOUR)).toBe(hour + HOUR);
  });
});

describe("subscribeToStaleClock", () => {
  const hour = Date.UTC(2026, 9, 5, 14);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(hour + 50 * MINUTE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("moves every reader on the same tick, not on read", () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubFirst = subscribeToStaleClock(first);
    const unsubSecond = subscribeToStaleClock(second);
    expect(readStaleClock()).toBe(hour);
    // Subscribing caught the module's value up to the faked hour; only the tick matters below.
    first.mockClear();
    second.mockClear();

    // Past the hour, before the ticker wakes: a reader that re-renders now must still see the
    // hour its neighbour memoized.
    vi.setSystemTime(hour + HOUR + MINUTE);
    expect(readStaleClock()).toBe(hour);

    // The hour tier wakes on the half hour.
    vi.advanceTimersByTime(29 * MINUTE);
    expect(readStaleClock()).toBe(hour + HOUR);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubFirst();
    unsubSecond();
  });
});
