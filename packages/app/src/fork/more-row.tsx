// FORK(RDeluxe/paseo): Cursor-style "More" at the end of a project's workspaces. See FORK.md.
//
// Not a toggle: each press shows the next page and the row goes away once everything shows.
// Same geometry as a workspace row so it sits in the column, with its label on the titles' rail,
// one step quieter than the rows above it and without an icon.
import { useCallback } from "react";
import { Pressable, Text, View, type PressableStateCallbackType } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { isWeb } from "@/constants/platform";
import { compactSidebarStyles, isCompactDensity } from "./sidebar-density";
import { useSidebarDensity } from "./sidebar-preferences";
import { useForkStrings } from "./strings";

export function ForkMoreRow({ onPress, testID }: { onPress: () => void; testID: string }) {
  const strings = useForkStrings();
  const compact = isCompactDensity(useSidebarDensity());
  const rowStyle = useCallback(
    ({ hovered = false, pressed }: PressableStateCallbackType & { hovered?: boolean }) => [
      styles.row,
      compact && compactSidebarStyles.toggleRow,
      hovered && !pressed && styles.rowHovered,
      pressed && styles.rowPressed,
    ],
    [compact],
  );
  return (
    <Pressable
      accessibilityRole={isWeb ? undefined : "button"}
      accessibilityLabel={strings.more}
      onPress={onPress}
      style={rowStyle}
      testID={testID}
    >
      <View style={styles.titleRail} />
      <Text style={styles.text} numberOfLines={1}>
        {strings.more}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Kept in step with upstream's `sidebar-group-toggle-row.tsx` row.
  row: {
    minHeight: 36,
    marginBottom: theme.spacing[0.5],
    paddingVertical: theme.spacing[2],
    paddingLeft: theme.spacing[2],
    paddingRight: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    userSelect: "none",
  },
  rowHovered: {
    backgroundColor: theme.colors.surfaceSidebarHover,
  },
  rowPressed: {
    backgroundColor: theme.colors.surface2,
  },
  // The width of a workspace row's status slot: the label lands on the titles' rail.
  titleRail: {
    width: theme.iconSize.md,
    flexShrink: 0,
  },
  text: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.fontSize.base,
    opacity: 0.8,
    minWidth: 0,
    flexShrink: 1,
  },
}));
