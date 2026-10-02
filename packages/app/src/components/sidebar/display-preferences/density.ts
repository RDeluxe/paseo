import type { ProjectIconSize } from "@/components/sidebar/project-leading-visual";

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

/** What a density does to the sidebar. Rows read their density through this table only. */
export interface SidebarDensityLayout {
  /** Rows drop their vertical padding and margins: 24px workspace rows, 28px project rows. */
  tightRows: boolean;
  /** The line under a workspace title. */
  metaRow: "full" | "none";
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
  compact: {
    tightRows: true,
    metaRow: "none",
    hostOnTitle: true,
    projectIconSize: "xs",
    emptyProjectPlaceholder: false,
  },
};
