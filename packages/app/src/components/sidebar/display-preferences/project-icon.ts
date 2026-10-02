/**
 * What leads a project row. The avatar names the project at a glance; the folder, as in Cursor,
 * says instead whether the project is open, and leaves the names to tell projects apart.
 */

export const SIDEBAR_PROJECT_ICONS = ["avatar", "folder"] as const;

export type SidebarProjectIcon = (typeof SIDEBAR_PROJECT_ICONS)[number];

export const DEFAULT_SIDEBAR_PROJECT_ICON: SidebarProjectIcon = "avatar";
