/**
 * How much of a project the sidebar shows before "More".
 *
 * A project with a long history buries the projects below it. The limit keeps each one to its
 * first few workspaces, and finished ones that have sat untouched past the cutoff go behind
 * "More" as well, so what stays on screen is what is current. "More" reveals a page at a time.
 */

export const SIDEBAR_WORKSPACE_LIMITS = [3, 5, 10, 20] as const;

export type SidebarWorkspaceLimit = (typeof SIDEBAR_WORKSPACE_LIMITS)[number];

export const DEFAULT_SIDEBAR_WORKSPACE_LIMIT: SidebarWorkspaceLimit = 5;

/** 0 never hides anything. */
export const SIDEBAR_HIDE_INACTIVE_DAYS = [0, 3, 7, 14, 30] as const;

export type SidebarHideInactiveDays = (typeof SIDEBAR_HIDE_INACTIVE_DAYS)[number];

export const DEFAULT_SIDEBAR_HIDE_INACTIVE_DAYS: SidebarHideInactiveDays = 14;

/** Each press of a project's "More" shows this many more workspaces. */
export const SIDEBAR_MORE_PAGE_SIZE = 10;
