/**
 * How tall the sidebar's rows are.
 *
 * Compact is for a sidebar tracking hundreds of workspaces, where the comfortable rows fit a
 * dozen on screen. It makes every workspace one line: the padding goes, the line under the title
 * goes, a remote host becomes a bare glyph at the end of the title, project icons shrink a
 * step, and an empty project drops its placeholder row.
 */

export const SIDEBAR_DENSITIES = ["comfortable", "compact"] as const;

export type SidebarDensity = (typeof SIDEBAR_DENSITIES)[number];

export const DEFAULT_SIDEBAR_DENSITY: SidebarDensity = "comfortable";
