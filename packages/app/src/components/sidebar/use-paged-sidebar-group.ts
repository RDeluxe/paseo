import { useCallback, useMemo, useState } from "react";
import { revealMore, splitLimitedGroup, type LimitedGroupOptions } from "./limited-sidebar-group";

export interface PagedGroupOptions<T> extends LimitedGroupOptions<T> {
  pageSize: number;
}

/**
 * A group that shows its first rows and reveals the rest a page per press, with nothing folding
 * back — the project list's "More". `useLimitedSidebarGroup` is the expand/collapse kind.
 */
export function usePagedSidebarGroup<T>(items: readonly T[], options: PagedGroupOptions<T>) {
  const [revealed, setRevealed] = useState(0);
  const split = useMemo(() => splitLimitedGroup(items, options), [items, options]);
  const { visible, remaining } = useMemo(
    () => revealMore(items, split, revealed),
    [items, split, revealed],
  );
  const { pageSize } = options;
  const showMore = useCallback(() => setRevealed((current) => current + pageSize), [pageSize]);

  return { visibleItems: visible, canShowMore: remaining > 0, showMore };
}
