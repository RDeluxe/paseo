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
}

export interface LimitedGroupSplit<T> {
  /** What shows collapsed, in the original order. */
  visible: T[];
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
  return { visible, overflowCount: items.length - visible.length };
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
