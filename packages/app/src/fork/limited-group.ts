// FORK(RDeluxe/paseo): which workspaces of a project show before "Show more". See FORK.md.
//
// Pure so it can be tested without React. `useLimitedSidebarGroup` calls it when a caller passes
// fork options; without them upstream's behaviour is untouched.

export interface LimitedGroupOptions<T> {
  /** How many items show before the toggle. */
  limit: number;
  /** Items that go behind the toggle whatever the limit — stale ones. */
  isHidden?: (item: T) => boolean;
  /** Items that always show, even past the limit — the one you are looking at. */
  isPinnedVisible?: (item: T) => boolean;
  /**
   * Cursor-style "More": each press reveals this many more items, and there is no way back.
   * Without it, upstream's expand/collapse toggle applies.
   */
  pageSize?: number;
}

export interface LimitedGroupSplit<T> {
  /** What shows collapsed, in the original order. */
  visible: T[];
  /** What the toggle reveals, in the original order. */
  overflow: T[];
  /** How many items the toggle reveals. */
  overflowCount: number;
}

export function splitLimitedGroup<T>(
  items: readonly T[],
  { limit, isHidden, isPinnedVisible }: LimitedGroupOptions<T>,
): LimitedGroupSplit<T> {
  const shown = new Set<T>();
  let budget = Math.max(0, limit);
  for (const item of items) {
    if (isPinnedVisible?.(item)) {
      shown.add(item);
      continue;
    }
    if (budget > 0 && !isHidden?.(item)) {
      shown.add(item);
      budget -= 1;
    }
  }
  const visible = items.filter((item) => shown.has(item));
  const overflow = items.filter((item) => !shown.has(item));
  return { visible, overflow, overflowCount: overflow.length };
}

/**
 * The collapsed set plus the first `revealed` overflow items, back in the list's own order, and
 * how many are still behind "More".
 */
export function revealMore<T>(
  items: readonly T[],
  split: LimitedGroupSplit<T>,
  revealed: number,
): { visible: T[]; remaining: number } {
  const extra = new Set(split.overflow.slice(0, Math.max(0, revealed)));
  const base = new Set(split.visible);
  const visible = items.filter((item) => base.has(item) || extra.has(item));
  return { visible, remaining: split.overflow.length - extra.size };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** A finished workspace whose last status change is older than `days`. Never hides active work. */
export function isStaleWorkspace(
  entry: { statusBucket: string; statusEnteredAt: Date | null } | undefined,
  days: number,
  now: number,
): boolean {
  if (!entry || days <= 0) return false;
  if (entry.statusBucket !== "done") return false;
  if (!entry.statusEnteredAt) return false;
  return now - entry.statusEnteredAt.getTime() > days * DAY_MS;
}
