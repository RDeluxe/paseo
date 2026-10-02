import type { ProjectIconSize } from "@/components/sidebar/project-leading-visual";

/**
 * How tall the sidebar's rows are.
 *
 * For a sidebar tracking hundreds of workspaces, where the comfortable rows fit a dozen on
 * screen. Semi-compact keeps everything a comfortable row says and takes the space out: tight
 * padding, the host as a bare glyph at the end of the title, a terser line under it, and an empty
 * project down to its header row. Compact goes further and makes every workspace one line: the
 * line under the title goes and project icons shrink a step.
 */

export const SIDEBAR_DENSITIES = ["comfortable", "semiCompact", "compact"] as const;

export type SidebarDensity = (typeof SIDEBAR_DENSITIES)[number];

export const DEFAULT_SIDEBAR_DENSITY: SidebarDensity = "comfortable";

/** What a density does to the sidebar. Rows read their density through this table only. */
export interface SidebarDensityLayout {
  /** Rows drop their vertical padding and margins: 24px workspace rows, 28px project rows. */
  tightRows: boolean;
  /** The line under a workspace title. */
  metaRow: "full" | "condensed" | "none";
  /** A remote host leaves the line under the title for a bare glyph at the end of the title. */
  hostOnTitle: boolean;
  projectIconSize: ProjectIconSize;
  /** An empty project shows its placeholder row; without it the project's "+" says the same. */
  emptyProjectPlaceholder: boolean;
}

export const SIDEBAR_DENSITY_LAYOUTS: Record<SidebarDensity, SidebarDensityLayout> = {
  comfortable: {
    tightRows: false,
    metaRow: "full",
    hostOnTitle: false,
    projectIconSize: "md",
    emptyProjectPlaceholder: true,
  },
  semiCompact: {
    tightRows: true,
    metaRow: "condensed",
    hostOnTitle: true,
    projectIconSize: "md",
    emptyProjectPlaceholder: false,
  },
  compact: {
    tightRows: true,
    metaRow: "none",
    hostOnTitle: true,
    projectIconSize: "xs",
    emptyProjectPlaceholder: false,
  },
};
