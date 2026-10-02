/**
 * How much of a project the sidebar shows before "More".
 *
 * A project with a long history buries the projects below it. The limit keeps each one to its
 * first few workspaces, and "More" reveals the rest a page at a time.
 */

export const SIDEBAR_WORKSPACE_LIMITS = [3, 5, 10, 20] as const;

export type SidebarWorkspaceLimit = (typeof SIDEBAR_WORKSPACE_LIMITS)[number];

export const DEFAULT_SIDEBAR_WORKSPACE_LIMIT: SidebarWorkspaceLimit = 5;

/** Each press of a project's "More" shows this many more workspaces. */
export const SIDEBAR_MORE_PAGE_SIZE = 10;
