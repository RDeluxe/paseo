import type {
  SidebarStatusWorkspacePlacement,
  SidebarWorkspacePlacement,
} from "@/hooks/use-sidebar-workspaces-list";
import type { ActiveWorkspaceSelection } from "@/stores/last-workspace-selection";
import type { SidebarWorkspaceLimit } from "./display-preferences/project-limit";

export interface LimitedGroupOptions<T> {
  limit: number;
  /** Shows even past the limit, without spending it. */
  isPinnedVisible?: (item: T) => boolean;
  /** Spends the limit while it lasts, then shows past it anyway. */
  isKeptVisible?: (item: T) => boolean;
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
  { limit, isPinnedVisible, isKeptVisible }: LimitedGroupOptions<T>,
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
      continue;
    }
    if (isKeptVisible?.(item)) {
      shown.add(item);
    }
  }
  return {
    visible: items.filter((item) => shown.has(item)),
    overflow: items.filter((item) => !shown.has(item)),
  };
}

/** The collapsed set plus the first `revealed` overflow items, back in their places. */
export function revealMore<T>({
  items,
  split,
  revealed,
}: {
  items: readonly T[];
  split: LimitedGroupSplit<T>;
  revealed: number;
}): RevealedGroup<T> {
  const shown = new Set([...split.visible, ...split.overflow.slice(0, revealed)]);
  return {
    visible: items.filter((item) => shown.has(item)),
    remaining: items.length - shown.size,
  };
}

export interface ProjectWorkspaceGroupInput {
  limit: SidebarWorkspaceLimit;
  entriesByKey: ReadonlyMap<string, Pick<SidebarStatusWorkspacePlacement, "statusBucket">>;
  /** The workspace on screen never hides. */
  selection: ActiveWorkspaceSelection | null;
}

/**
 * How a project limits its workspaces. The project block renders from it and the keyboard
 * shortcuts number from it, so no shortcut lands on a row behind "More". The shortcuts pass no
 * selection: the selected row keeps its place on screen, not a number. As in upstream's project
 * groups, a workspace that is working or waiting on you shows past the limit.
 */
export function projectWorkspaceGroupOptions({
  limit,
  entriesByKey,
  selection,
}: ProjectWorkspaceGroupInput): LimitedGroupOptions<SidebarWorkspacePlacement> {
  return {
    limit,
    isKeptVisible: (workspace) => {
      const entry = entriesByKey.get(workspace.workspaceKey);
      return entry !== undefined && entry.statusBucket !== "done";
    },
    isPinnedVisible: (workspace) =>
      selection !== null &&
      workspace.serverId === selection.serverId &&
      workspace.workspaceId === selection.workspaceId,
  };
}
