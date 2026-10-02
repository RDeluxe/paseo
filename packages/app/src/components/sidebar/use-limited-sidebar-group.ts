import { useCallback, useMemo, useState } from "react";
import { revealMore, splitLimitedGroup, type LimitedGroupOptions } from "./limited-sidebar-group";

const INITIAL_VISIBLE_ITEMS = 20;
const DEFAULT_OPTIONS = { limit: INITIAL_VISIBLE_ITEMS };

export function useLimitedSidebarGroup<T>(
  items: readonly T[],
  options: LimitedGroupOptions<T> = DEFAULT_OPTIONS,
) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const { pageSize } = options;
  const split = useMemo(() => splitLimitedGroup(items, options), [items, options]);
  const paged = useMemo(
    () => (pageSize === undefined ? null : revealMore(items, split, revealed)),
    [pageSize, items, split, revealed],
  );
  const visibleItems = useMemo(() => {
    if (paged) return paged.visible;
    return expanded ? items.slice() : split.visible;
  }, [paged, expanded, items, split]);
  const canToggle = paged ? paged.remaining > 0 : split.overflow.length > 0;
  const toggleExpanded = useCallback(() => {
    if (pageSize === undefined) setExpanded((current) => !current);
    else setRevealed((current) => current + pageSize);
  }, [pageSize]);

  return { visibleItems, expanded, canToggle, toggleExpanded };
}
