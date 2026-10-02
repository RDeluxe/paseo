import { useCallback, useMemo, useState } from "react";
// FORK(RDeluxe/paseo): optional per-call limit, stale hiding and Cursor-style "More". See FORK.md.
import { revealMore, splitLimitedGroup, type LimitedGroupOptions } from "@/fork/limited-group";

const INITIAL_VISIBLE_ITEMS = 20;

export function useLimitedSidebarGroup<T>(items: readonly T[], options?: LimitedGroupOptions<T>) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const pageSize = options?.pageSize;
  const split = useMemo(
    () => splitLimitedGroup(items, options ?? { limit: INITIAL_VISIBLE_ITEMS }),
    [items, options],
  );
  const paged = useMemo(
    () => (pageSize ? revealMore(items, split, revealed) : null),
    [pageSize, items, split, revealed],
  );
  const visibleItems = useMemo(() => {
    if (paged) return paged.visible;
    return expanded ? items.slice() : split.visible;
  }, [paged, expanded, items, split]);
  const canToggle = paged ? paged.remaining > 0 : split.overflowCount > 0;
  const toggleExpanded = useCallback(() => {
    if (pageSize) setRevealed((current) => current + pageSize);
    else setExpanded((current) => !current);
  }, [pageSize]);

  return { visibleItems, expanded, canToggle, toggleExpanded };
}
