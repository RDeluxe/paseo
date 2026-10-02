/**
 * How tall the sidebar's rows are.
 *
 * Compact is for a sidebar tracking hundreds of workspaces, where the comfortable rows fit a
 * dozen on screen. It takes the padding out, moves a remote host from the line under the title
 * to a bare glyph at its end, and drops the placeholder row under an empty project.
 */

export const SIDEBAR_DENSITIES = ["comfortable", "compact"] as const;

export type SidebarDensity = (typeof SIDEBAR_DENSITIES)[number];

export const DEFAULT_SIDEBAR_DENSITY: SidebarDensity = "compact";
