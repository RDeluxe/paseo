/**
 * How tall the sidebar's rows are.
 *
 * Compact is for a sidebar tracking hundreds of workspaces, where the comfortable rows fit a
 * dozen on screen. It only takes padding out; what a row says stays the same.
 */

export const SIDEBAR_DENSITIES = ["comfortable", "compact"] as const;

export type SidebarDensity = (typeof SIDEBAR_DENSITIES)[number];

export const DEFAULT_SIDEBAR_DENSITY: SidebarDensity = "compact";
