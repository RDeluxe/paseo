// FORK(RDeluxe/paseo): compact sidebar rows. See FORK.md.
//
// Upstream's design doc asks for 8–12px of vertical padding on sidebar rows and calls tighter
// rows wrong. The fork disagrees for people tracking hundreds of conversations, Cursor-style.
// These are overrides appended after upstream's own row styles, so upstream keeps owning the
// comfortable look and only the deltas live here.
import { StyleSheet } from "react-native-unistyles";
import type { SidebarDensity } from "./sidebar-preferences";

export const compactSidebarStyles = StyleSheet.create((theme) => ({
  projectRow: {
    minHeight: 26,
    paddingVertical: theme.spacing[1],
    marginBottom: 0,
  },
  workspaceRow: {
    minHeight: 24,
    paddingVertical: 3,
    marginBottom: 0,
    gap: 2,
  },
  toggleRow: {
    minHeight: 24,
    paddingVertical: 3,
    marginBottom: 0,
  },
}));

export function isCompactDensity(density: SidebarDensity): boolean {
  return density === "compact";
}
