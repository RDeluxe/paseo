import { useCallback, useMemo, useState } from "react";
// FORK(RDeluxe/paseo): optional per-call limit and stale hiding. See FORK.md.
import { splitLimitedGroup, type LimitedGroupOptions } from "@/fork/limited-group";

const INITIAL_VISIBLE_ITEMS = 20;

export function useLimitedSidebarGroup<T>(items: readonly T[], options?: LimitedGroupOptions<T>) {
  const [expanded, setExpanded] = useState(false);
  const split = useMemo(
    () => splitLimitedGroup(items, options ?? { limit: INITIAL_VISIBLE_ITEMS }),
    [items, options],
  );
  const visibleItems = useMemo(
    () => (expanded ? items.slice() : split.visible),
    [expanded, items, split],
  );
  const canToggle = split.overflowCount > 0;
  const toggleExpanded = useCallback(() => setExpanded((current) => !current), []);

  return { visibleItems, expanded, canToggle, toggleExpanded };
}
