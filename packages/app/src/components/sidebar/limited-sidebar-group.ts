import type { SidebarWorkspacePlacement } from "@/hooks/use-sidebar-workspaces-list";
import type { ActiveWorkspaceSelection } from "@/stores/last-workspace-selection";
import type { SidebarWorkspaceLimit } from "./display-preferences/project-limit";

export interface LimitedGroupOptions<T> {
  limit: number;
  /** Shows even past the limit, without spending it. */
  isPinnedVisible?: (item: T) => boolean;
}

export interface LimitedGroupSplit<T> {
  visible: T[];
  overflow: T[];
}

export interface RevealedGroup<T> {
  visible: T[];
  remaining: number;
}

/** What shows before the toggle and what it reveals, both in the group's own order. */
export function splitLimitedGroup<T>(
  items: readonly T[],
  { limit, isPinnedVisible }: LimitedGroupOptions<T>,
): LimitedGroupSplit<T> {
  const shown = new Set<T>();
  let budget = limit;
  for (const item of items) {
    if (isPinnedVisible?.(item)) {
      shown.add(item);
      continue;
    }
    if (budget > 0) {
      shown.add(item);
      budget -= 1;
    }
  }
  return {
    visible: items.filter((item) => shown.has(item)),
    overflow: items.filter((item) => !shown.has(item)),
  };
}

/** The collapsed set plus the first `revealed` overflow items, back in their places. */
export function revealMore<T>(
  items: readonly T[],
  split: LimitedGroupSplit<T>,
  revealed: number,
): RevealedGroup<T> {
  const shown = new Set([...split.visible, ...split.overflow.slice(0, revealed)]);
  return {
    visible: items.filter((item) => shown.has(item)),
    remaining: items.length - shown.size,
  };
}

export interface ProjectWorkspaceGroupInput {
  limit: SidebarWorkspaceLimit;
  /** The workspace on screen never hides. */
  selection: ActiveWorkspaceSelection | null;
}

/** How a project limits its workspaces. */
export function projectWorkspaceGroupOptions({
  limit,
  selection,
}: ProjectWorkspaceGroupInput): LimitedGroupOptions<SidebarWorkspacePlacement> {
  return {
    limit,
    isPinnedVisible: (workspace) =>
      selection !== null &&
      workspace.serverId === selection.serverId &&
      workspace.workspaceId === selection.workspaceId,
  };
}
