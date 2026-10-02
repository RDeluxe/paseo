import { describe, expect, it } from "vitest";
import type { SidebarWorkspacePlacement } from "@/hooks/use-sidebar-workspaces-list";
import {
  projectWorkspaceGroupOptions,
  revealMore,
  splitLimitedGroup,
} from "./limited-sidebar-group";

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

  it("shows pinned-visible items past the limit, in their place, without spending it", () => {
    expect(splitLimitedGroup(items, { limit: 2, isPinnedVisible: (item) => item === "f" })).toEqual(
      { visible: ["a", "b", "f"], overflow: ["c", "d", "e"] },
    );
  });

  it("lets kept-visible items spend the limit, then shows them past it", () => {
    const isKeptVisible = (item: string) => item === "a" || item === "e";
    expect(splitLimitedGroup(items, { limit: 2, isKeptVisible })).toEqual({
      visible: ["a", "b", "e"],
      overflow: ["c", "d", "f"],
    });
  });
});

describe("revealMore", () => {
  const items = Array.from({ length: 30 }, (_, index) => `w${index}`);
  const split = splitLimitedGroup(items, { limit: 5 });

  it("shows the collapsed set before any press", () => {
    expect(revealMore({ items, split, revealed: 0 })).toEqual({
      visible: items.slice(0, 5),
      remaining: 25,
    });
  });

  it("adds a page per press and stops at the end", () => {
    expect(revealMore({ items, split, revealed: 10 })).toEqual({
      visible: items.slice(0, 15),
      remaining: 15,
    });
    expect(revealMore({ items, split, revealed: 30 })).toEqual({ visible: items, remaining: 0 });
  });
});

describe("projectWorkspaceGroupOptions", () => {
  it("keeps the selected workspace on screen past the limit", () => {
    const workspaces = ["a", "b", "c", "d", "e", "f"].map(placement);
    const options = projectWorkspaceGroupOptions({
      limit: 3,
      entriesByKey: new Map(),
      selection: { serverId: "server", workspaceId: "f" },
    });
    expect(splitLimitedGroup(workspaces, options).visible.map((w) => w.workspaceId)).toEqual([
      "a",
      "b",
      "c",
      "f",
    ]);
  });

  it("keeps working and attention workspaces on screen past the limit", () => {
    const workspaces = ["a", "b", "c", "d", "e", "f"].map(placement);
    const options = projectWorkspaceGroupOptions({
      limit: 3,
      entriesByKey: new Map([
        ["server:a", { statusBucket: "running" as const }],
        ["server:b", { statusBucket: "done" as const }],
        ["server:c", { statusBucket: "done" as const }],
        ["server:d", { statusBucket: "done" as const }],
        ["server:e", { statusBucket: "needs_input" as const }],
        ["server:f", { statusBucket: "done" as const }],
      ]),
      selection: null,
    });
    expect(splitLimitedGroup(workspaces, options).visible.map((w) => w.workspaceId)).toEqual([
      "a",
      "b",
      "c",
      "e",
    ]);
  });
});
