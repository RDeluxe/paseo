import { describe, expect, it } from "vitest";
import { isStaleWorkspace, revealMore, splitLimitedGroup } from "./limited-group";

describe("splitLimitedGroup", () => {
  const items = ["a", "b", "c", "d", "e", "f"];

  it("keeps the first `limit` items in order", () => {
    expect(splitLimitedGroup(items, { limit: 3 })).toEqual({
      visible: ["a", "b", "c"],
      overflow: ["d", "e", "f"],
      overflowCount: 3,
    });
  });

  it("shows everything when under the limit", () => {
    expect(splitLimitedGroup(items, { limit: 10 })).toEqual({
      visible: items,
      overflow: [],
      overflowCount: 0,
    });
  });

  it("moves hidden items behind the toggle and fills the budget with the next ones", () => {
    const hidden = new Set(["a", "c"]);
    expect(splitLimitedGroup(items, { limit: 3, isHidden: (item) => hidden.has(item) })).toEqual({
      visible: ["b", "d", "e"],
      overflow: ["a", "c", "f"],
      overflowCount: 3,
    });
  });

  it("always shows pinned-visible items, without spending the budget, in original order", () => {
    const result = splitLimitedGroup(items, {
      limit: 2,
      isHidden: (item) => item === "f",
      isPinnedVisible: (item) => item === "f",
    });
    expect(result).toEqual({
      visible: ["a", "b", "f"],
      overflow: ["c", "d", "e"],
      overflowCount: 3,
    });
  });

  it("can hide everything stale", () => {
    expect(splitLimitedGroup(items, { limit: 5, isHidden: () => true })).toEqual({
      visible: [],
      overflow: items,
      overflowCount: 6,
    });
  });
});

describe("revealMore", () => {
  const items = Array.from({ length: 30 }, (_, index) => `w${index}`);
  const split = splitLimitedGroup(items, { limit: 5 });

  it("shows only the collapsed set before any press", () => {
    expect(revealMore(items, split, 0)).toEqual({ visible: items.slice(0, 5), remaining: 25 });
  });

  it("adds a page per press", () => {
    expect(revealMore(items, split, 10)).toEqual({ visible: items.slice(0, 15), remaining: 15 });
    expect(revealMore(items, split, 20)).toEqual({ visible: items.slice(0, 25), remaining: 5 });
  });

  it("stops at the end", () => {
    expect(revealMore(items, split, 30)).toEqual({ visible: items, remaining: 0 });
  });

  it("puts revealed stale items back in their place in the list", () => {
    const stale = new Set(["w1", "w2"]);
    const staleSplit = splitLimitedGroup(items.slice(0, 8), {
      limit: 3,
      isHidden: (item) => stale.has(item),
    });
    expect(revealMore(items.slice(0, 8), staleSplit, 2)).toEqual({
      visible: ["w0", "w1", "w2", "w3", "w4"],
      remaining: 3,
    });
  });
});

describe("isStaleWorkspace", () => {
  const now = Date.UTC(2026, 9, 2);
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000);

  it("hides a finished workspace older than the threshold", () => {
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: daysAgo(15) }, 14, now)).toBe(
      true,
    );
  });

  it("keeps a recent finished workspace", () => {
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: daysAgo(2) }, 14, now)).toBe(
      false,
    );
  });

  it("never hides active work, however old", () => {
    for (const statusBucket of ["running", "needs_input", "failed", "attention"]) {
      expect(isStaleWorkspace({ statusBucket, statusEnteredAt: daysAgo(400) }, 14, now)).toBe(
        false,
      );
    }
  });

  it("is off at 0 days and without a date", () => {
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: daysAgo(400) }, 0, now)).toBe(
      false,
    );
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: null }, 14, now)).toBe(false);
    expect(isStaleWorkspace(undefined, 14, now)).toBe(false);
  });
});
