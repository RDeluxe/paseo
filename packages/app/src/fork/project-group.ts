// FORK(RDeluxe/paseo): the options `ProjectBlock` hands to `useLimitedSidebarGroup`. See FORK.md.
import { useMemo } from "react";
import type { ActiveWorkspaceSelection } from "@/stores/last-workspace-selection";
import { isStaleWorkspace, type LimitedGroupOptions } from "./limited-group";
import { useForkSidebarPreferences } from "./sidebar-preferences";

interface Placement {
  workspaceKey: string;
  serverId: string;
  workspaceId: string;
}

interface EntryActivity {
  statusBucket: string;
  statusEnteredAt: Date | null;
}

export function useForkProjectGroupOptions<T extends Placement>(
  entriesByKey: ReadonlyMap<string, EntryActivity>,
  selection: ActiveWorkspaceSelection | null,
): LimitedGroupOptions<T> {
  const limit = useForkSidebarPreferences((state) => state.workspaceLimit);
  const hideInactiveDays = useForkSidebarPreferences((state) => state.hideInactiveDays);
  return useMemo(() => {
    const now = Date.now();
    return {
      limit,
      isHidden: (item: T) =>
        isStaleWorkspace(entriesByKey.get(item.workspaceKey), hideInactiveDays, now),
      // The workspace on screen never hides behind "Show more", stale or not.
      isPinnedVisible: (item: T) =>
        selection !== null &&
        item.serverId === selection.serverId &&
        item.workspaceId === selection.workspaceId,
    };
  }, [limit, hideInactiveDays, entriesByKey, selection]);
}
