import type {
  SidebarStatusWorkspacePlacement,
  SidebarWorkspacePlacement,
} from "@/hooks/use-sidebar-workspaces-list";
import type { ActiveWorkspaceSelection } from "@/stores/last-workspace-selection";
import type {
  SidebarHideInactiveDays,
  SidebarWorkspaceLimit,
} from "./display-preferences/project-limit";

export interface LimitedGroupOptions<T> {
  limit: number;
  /** Goes behind the toggle whatever the limit. */
  isHidden?: (item: T) => boolean;
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
  { limit, isHidden, isPinnedVisible }: LimitedGroupOptions<T>,
): LimitedGroupSplit<T> {
  const shown = new Set<T>();
  let budget = limit;
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Finished and untouched for longer than `days`. Anything still running, waiting on you, failed
 * or unread stays, however old: hiding those would hide work.
 */
export function isStaleWorkspace(
  entry: Pick<SidebarStatusWorkspacePlacement, "statusBucket" | "statusEnteredAt">,
  days: SidebarHideInactiveDays,
  now: number,
): boolean {
  if (days === 0 || entry.statusBucket !== "done" || entry.statusEnteredAt === null) {
    return false;
  }
  return now - entry.statusEnteredAt.getTime() > days * DAY_MS;
}

export interface ProjectWorkspaceGroupInput {
  limit: SidebarWorkspaceLimit;
  hideInactiveDays: SidebarHideInactiveDays;
  entriesByKey: ReadonlyMap<
    string,
    Pick<SidebarStatusWorkspacePlacement, "statusBucket" | "statusEnteredAt">
  >;
  /** The workspace on screen never hides, stale or not. */
  selection: ActiveWorkspaceSelection | null;
  now: number;
}

/** How a project limits its workspaces. */
export function projectWorkspaceGroupOptions({
  limit,
  hideInactiveDays,
  entriesByKey,
  selection,
  now,
}: ProjectWorkspaceGroupInput): LimitedGroupOptions<SidebarWorkspacePlacement> {
  return {
    limit,
    isHidden: (workspace) => {
      const entry = entriesByKey.get(workspace.workspaceKey);
      return entry !== undefined && isStaleWorkspace(entry, hideInactiveDays, now);
    },
    isPinnedVisible: (workspace) =>
      selection !== null &&
      workspace.serverId === selection.serverId &&
      workspace.workspaceId === selection.workspaceId,
  };
}
