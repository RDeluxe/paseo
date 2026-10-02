import { describe, expect, it } from "vitest";
import type { SidebarWorkspacePlacement } from "@/hooks/use-sidebar-workspaces-list";
import {
  isStaleWorkspace,
  projectWorkspaceGroupOptions,
  revealMore,
  splitLimitedGroup,
} from "./limited-sidebar-group";

const NOW = Date.UTC(2026, 9, 2);

function daysAgo(days: number): Date {
  return new Date(NOW - days * 24 * 60 * 60 * 1000);
}

function placement(workspaceId: string): SidebarWorkspacePlacement {
  return {
    workspaceKey: `server:${workspaceId}`,
    serverId: "server",
    workspaceId,
    projectViewKey: "project",
    projectName: "Project",
    projectKind: "git",
    workspaceKind: "worktree",
    name: workspaceId,
  };
}

describe("splitLimitedGroup", () => {
  const items = ["a", "b", "c", "d", "e", "f"];

  it("keeps the first `limit` items in order", () => {
    expect(splitLimitedGroup(items, { limit: 3 })).toEqual({
      visible: ["a", "b", "c"],
      overflow: ["d", "e", "f"],
    });
  });

  it("shows everything when under the limit", () => {
    expect(splitLimitedGroup(items, { limit: 10 })).toEqual({ visible: items, overflow: [] });
  });

  it("moves hidden items behind the toggle and fills the limit with the next ones", () => {
    const hidden = new Set(["a", "c"]);
    expect(splitLimitedGroup(items, { limit: 3, isHidden: (item) => hidden.has(item) })).toEqual({
      visible: ["b", "d", "e"],
      overflow: ["a", "c", "f"],
    });
  });

  it("shows pinned-visible items past the limit, in their place, without spending it", () => {
    expect(
      splitLimitedGroup(items, {
        limit: 2,
        isHidden: (item) => item === "f",
        isPinnedVisible: (item) => item === "f",
      }),
    ).toEqual({ visible: ["a", "b", "f"], overflow: ["c", "d", "e"] });
  });
});

describe("revealMore", () => {
  const items = Array.from({ length: 30 }, (_, index) => `w${index}`);
  const split = splitLimitedGroup(items, { limit: 5 });

  it("shows the collapsed set before any press", () => {
    expect(revealMore(items, split, 0)).toEqual({ visible: items.slice(0, 5), remaining: 25 });
  });

  it("adds a page per press and stops at the end", () => {
    expect(revealMore(items, split, 10)).toEqual({ visible: items.slice(0, 15), remaining: 15 });
    expect(revealMore(items, split, 30)).toEqual({ visible: items, remaining: 0 });
  });

  it("puts revealed hidden items back in their place", () => {
    const group = items.slice(0, 8);
    const hidden = new Set(["w1", "w2"]);
    const hiddenSplit = splitLimitedGroup(group, {
      limit: 3,
      isHidden: (item) => hidden.has(item),
    });
    expect(revealMore(group, hiddenSplit, 2)).toEqual({
      visible: ["w0", "w1", "w2", "w3", "w4"],
      remaining: 3,
    });
  });
});

describe("isStaleWorkspace", () => {
  it("hides a finished workspace older than the cutoff", () => {
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: daysAgo(15) }, 14, NOW)).toBe(
      true,
    );
  });

  it("keeps a recently finished workspace", () => {
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: daysAgo(2) }, 14, NOW)).toBe(
      false,
    );
  });

  it("never hides work that is not finished and read", () => {
    for (const statusBucket of ["running", "needs_input", "failed", "attention"] as const) {
      expect(isStaleWorkspace({ statusBucket, statusEnteredAt: daysAgo(400) }, 14, NOW)).toBe(
        false,
      );
    }
  });

  it("hides nothing at 0 days or without a date", () => {
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: daysAgo(400) }, 0, NOW)).toBe(
      false,
    );
    expect(isStaleWorkspace({ statusBucket: "done", statusEnteredAt: null }, 14, NOW)).toBe(false);
  });
});

describe("projectWorkspaceGroupOptions", () => {
  const workspaces = ["a", "b", "c", "d"].map(placement);
  const entriesByKey = new Map([
    ["server:a", { statusBucket: "done" as const, statusEnteredAt: daysAgo(30) }],
    ["server:b", { statusBucket: "running" as const, statusEnteredAt: daysAgo(30) }],
  ]);

  it("hides stale workspaces and keeps the selected one on screen", () => {
    const options = projectWorkspaceGroupOptions({
      limit: 1,
      hideInactiveDays: 14,
      entriesByKey,
      selection: { serverId: "server", workspaceId: "d" },
      now: NOW,
    });
    expect(splitLimitedGroup(workspaces, options).visible.map((w) => w.workspaceId)).toEqual([
      "b",
      "d",
    ]);
  });
});
