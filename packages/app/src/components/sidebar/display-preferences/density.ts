/**
 * How tall the sidebar's rows are.
 *
 * For a sidebar tracking hundreds of workspaces, where the comfortable rows fit a dozen on
 * screen. Semi-compact keeps everything a comfortable row says and takes the space out: tight
 * padding, the host as a bare glyph at the end of the title, and a terser line under it.
 * Compact goes further and makes every workspace one line: the line under the title goes,
 * project icons shrink a step, and an empty project drops its placeholder row.
 */

export const SIDEBAR_DENSITIES = ["comfortable", "semiCompact", "compact"] as const;

export type SidebarDensity = (typeof SIDEBAR_DENSITIES)[number];

export const DEFAULT_SIDEBAR_DENSITY: SidebarDensity = "comfortable";

/** Semi-compact and compact share the tight row geometry; they differ in what a row says. */
export function hasCompactRows(density: SidebarDensity): boolean {
  return density !== "comfortable";
}
