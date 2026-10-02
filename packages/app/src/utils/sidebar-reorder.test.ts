import { describe, expect, it } from "vitest";

import {
  hasVisibleOrderChanged,
  mergeIntoVisibleSlots,
  mergeWithRemainder,
} from "./sidebar-reorder";

describe("hasVisibleOrderChanged", () => {
  it("returns false when visible order is unchanged", () => {
    expect(
      hasVisibleOrderChanged({
        currentOrder: ["a", "b", "c", "d"],
        reorderedVisibleKeys: ["a", "b", "c"],
      }),
    ).toBe(false);
  });

  it("returns true when visible items are reordered", () => {
    expect(
      hasVisibleOrderChanged({
        currentOrder: ["a", "b", "c", "d"],
        reorderedVisibleKeys: ["b", "a", "c"],
      }),
    ).toBe(true);
  });

  it("returns true when a visible key is missing from current order", () => {
    expect(
      hasVisibleOrderChanged({
        currentOrder: ["a", "b"],
        reorderedVisibleKeys: ["a", "c"],
      }),
    ).toBe(true);
  });
});

describe("mergeWithRemainder", () => {
  it("appends non-visible stored keys after reordered visible keys", () => {
    expect(
      mergeWithRemainder({
        currentOrder: ["a", "x", "b", "y"],
        reorderedVisibleKeys: ["b", "a"],
      }),
    ).toEqual(["b", "a", "x", "y"]);
  });

  it("keeps unknown current keys when no visible keys are reordered", () => {
    expect(
      mergeWithRemainder({
        currentOrder: ["stale", "hidden"],
        reorderedVisibleKeys: [],
      }),
    ).toEqual(["stale", "hidden"]);
  });
});

describe("mergeIntoVisibleSlots", () => {
  it("keeps hidden keys in place and reorders the visible ones among their own slots", () => {
    expect(
      mergeIntoVisibleSlots({
        currentOrder: ["a", "b", "stale", "c", "d", "selected"],
        reorderedVisibleKeys: ["b", "a", "c", "selected"],
      }),
    ).toEqual(["b", "a", "stale", "c", "d", "selected"]);
  });

  it("puts visible keys the stored order does not know yet first", () => {
    expect(
      mergeIntoVisibleSlots({
        currentOrder: ["a", "hidden", "b"],
        reorderedVisibleKeys: ["new", "b", "a"],
      }),
    ).toEqual(["new", "b", "hidden", "a"]);
  });
});
