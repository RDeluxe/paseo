import { describe, expect, it } from "vitest";
import { isStaleWorkspace, splitLimitedGroup } from "./limited-group";

describe("splitLimitedGroup", () => {
  const items = ["a", "b", "c", "d", "e", "f"];

  it("keeps the first `limit` items in order", () => {
    expect(splitLimitedGroup(items, { limit: 3 })).toEqual({
      visible: ["a", "b", "c"],
      overflowCount: 3,
    });
  });

  it("shows everything when under the limit", () => {
    expect(splitLimitedGroup(items, { limit: 10 })).toEqual({ visible: items, overflowCount: 0 });
  });

  it("moves hidden items behind the toggle and fills the budget with the next ones", () => {
    const hidden = new Set(["a", "c"]);
    expect(splitLimitedGroup(items, { limit: 3, isHidden: (item) => hidden.has(item) })).toEqual({
      visible: ["b", "d", "e"],
      overflowCount: 3,
    });
  });

  it("always shows pinned-visible items, without spending the budget, in original order", () => {
    const result = splitLimitedGroup(items, {
      limit: 2,
      isHidden: (item) => item === "f",
      isPinnedVisible: (item) => item === "f",
    });
    expect(result).toEqual({ visible: ["a", "b", "f"], overflowCount: 3 });
  });

  it("can hide everything stale", () => {
    expect(splitLimitedGroup(items, { limit: 5, isHidden: () => true })).toEqual({
      visible: [],
      overflowCount: 6,
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
