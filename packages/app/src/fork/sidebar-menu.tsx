// FORK(RDeluxe/paseo): the fork's entries in the sidebar display-preferences menu. See FORK.md.
//
// `display-preferences/menu.tsx` only gains two hook-ins: the pages from `useForkSidebarMenuPages`
// and `<ForkSidebarMenuEntries />` at the end of the root list. Everything else lives here.
import { useCallback, useMemo, type ComponentType, type ReactElement } from "react";
import { withUnistyles } from "react-native-unistyles";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  History,
  ListFilter,
  Rows3,
  Rows4,
} from "lucide-react-native";
import {
  MenuItem,
  MenuSeparator,
  MenuSubTrigger,
  type MenuPageDefinition,
} from "@/components/ui/menu";
import { useSidebarModel } from "@/components/sidebar/sidebar-model";
import { useSidebarCollapsedSectionsStore } from "@/stores/sidebar-collapsed-sections-store";
import type { Theme } from "@/styles/theme";
import {
  SIDEBAR_HIDE_INACTIVE_DAYS,
  SIDEBAR_WORKSPACE_LIMITS,
  useForkSidebarPreferences,
  type SidebarDensity,
} from "./sidebar-preferences";
import { useForkStrings, type ForkStrings } from "./strings";

const ICON_SIZE = 14;
const muted = (theme: Theme) => ({ color: theme.colors.foregroundMuted });
type Icon = ComponentType<{ size?: number; uniProps?: (theme: Theme) => { color: string } }>;
const themed = (icon: unknown) => withUnistyles(icon as ComponentType<object>) as unknown as Icon;
const ThemedRows3 = themed(Rows3);
const ThemedRows4 = themed(Rows4);
const ThemedListFilter = themed(ListFilter);
const ThemedHistory = themed(History);
const ThemedCollapse = themed(ChevronsDownUp);
const ThemedExpand = themed(ChevronsUpDown);

function leadingIcon(IconComponent: Icon): ReactElement {
  return <IconComponent size={ICON_SIZE} uniProps={muted} />;
}

const COLLAPSE_ICON = leadingIcon(ThemedCollapse);
const EXPAND_ICON = leadingIcon(ThemedExpand);

const DENSITY_LABEL: Record<SidebarDensity, keyof ForkStrings> = {
  comfortable: "densityComfortable",
  compact: "densityCompact",
};

function hideInactiveLabel(strings: ForkStrings, days: number): string {
  return days === 0 ? strings.hideInactiveOff : strings.hideInactiveValue(days);
}

function ForkOptionItem<Value extends string | number>({
  value,
  label,
  icon,
  selected,
  onSelect,
  testID,
}: {
  value: Value;
  label: string;
  icon: Icon;
  selected: boolean;
  onSelect: (value: Value) => void;
  testID: string;
}): ReactElement {
  const handleSelect = useCallback(() => onSelect(value), [onSelect, value]);
  const leading = useMemo(() => leadingIcon(icon), [icon]);
  return (
    <MenuItem selected={selected} leading={leading} onSelect={handleSelect} testID={testID}>
      {label}
    </MenuItem>
  );
}

const DENSITIES = ["comfortable", "compact"] as const;
const DENSITY_ICONS: Record<SidebarDensity, Icon> = {
  comfortable: ThemedRows3,
  compact: ThemedRows4,
};

function DensityPage(): ReactElement {
  const strings = useForkStrings();
  const density = useForkSidebarPreferences((state) => state.density);
  const setDensity = useForkSidebarPreferences((state) => state.setDensity);
  return (
    <>
      {DENSITIES.map((value) => (
        <ForkOptionItem
          key={value}
          value={value}
          label={strings[DENSITY_LABEL[value]] as string}
          icon={DENSITY_ICONS[value]}
          selected={density === value}
          onSelect={setDensity}
          testID={`fork-sidebar-density-${value}`}
        />
      ))}
    </>
  );
}

function WorkspaceLimitPage(): ReactElement {
  const strings = useForkStrings();
  const limit = useForkSidebarPreferences((state) => state.workspaceLimit);
  const setLimit = useForkSidebarPreferences((state) => state.setWorkspaceLimit);
  return (
    <>
      {SIDEBAR_WORKSPACE_LIMITS.map((value) => (
        <ForkOptionItem
          key={value}
          value={value}
          label={strings.workspaceLimitValue(value)}
          icon={ThemedListFilter}
          selected={limit === value}
          onSelect={setLimit}
          testID={`fork-sidebar-limit-${value}`}
        />
      ))}
    </>
  );
}

function HideInactivePage(): ReactElement {
  const strings = useForkStrings();
  const days = useForkSidebarPreferences((state) => state.hideInactiveDays);
  const setDays = useForkSidebarPreferences((state) => state.setHideInactiveDays);
  return (
    <>
      {SIDEBAR_HIDE_INACTIVE_DAYS.map((value) => (
        <ForkOptionItem
          key={value}
          value={value}
          label={hideInactiveLabel(strings, value)}
          icon={ThemedHistory}
          selected={days === value}
          onSelect={setDays}
          testID={`fork-sidebar-hide-inactive-${value}`}
        />
      ))}
    </>
  );
}

export function useForkSidebarMenuPages(): MenuPageDefinition[] {
  const strings = useForkStrings();
  return useMemo(
    () => [
      { id: "forkDensity", title: strings.density, content: <DensityPage /> },
      { id: "forkWorkspaceLimit", title: strings.workspaceLimit, content: <WorkspaceLimitPage /> },
      { id: "forkHideInactive", title: strings.hideInactive, content: <HideInactivePage /> },
    ],
    [strings],
  );
}

export function ForkSidebarMenuEntries(): ReactElement {
  const strings = useForkStrings();
  const density = useForkSidebarPreferences((state) => state.density);
  const limit = useForkSidebarPreferences((state) => state.workspaceLimit);
  const days = useForkSidebarPreferences((state) => state.hideInactiveDays);
  const { allProjects } = useSidebarModel();

  const collapseAll = useCallback(() => {
    useSidebarCollapsedSectionsStore.setState((state) => ({
      ...state,
      collapsedProjectKeys: new Set(allProjects.map((project) => project.viewKey)),
    }));
  }, [allProjects]);
  const expandAll = useCallback(() => {
    useSidebarCollapsedSectionsStore.setState((state) => ({
      ...state,
      collapsedProjectKeys: new Set<string>(),
    }));
  }, []);

  return (
    <>
      <MenuSeparator />
      <MenuSubTrigger
        id="forkDensity"
        value={strings[DENSITY_LABEL[density]] as string}
        testID="fork-sidebar-density"
      >
        {strings.density}
      </MenuSubTrigger>
      <MenuSubTrigger id="forkWorkspaceLimit" value={String(limit)} testID="fork-sidebar-limit">
        {strings.workspaceLimit}
      </MenuSubTrigger>
      <MenuSubTrigger
        id="forkHideInactive"
        value={days === 0 ? strings.hideInactiveOff : strings.daysShort(days)}
        testID="fork-sidebar-hide-inactive"
      >
        {strings.hideInactive}
      </MenuSubTrigger>
      <MenuSeparator />
      <MenuItem leading={COLLAPSE_ICON} onSelect={collapseAll} testID="fork-sidebar-collapse-all">
        {strings.collapseAll}
      </MenuItem>
      <MenuItem leading={EXPAND_ICON} onSelect={expandAll} testID="fork-sidebar-expand-all">
        {strings.expandAll}
      </MenuItem>
    </>
  );
}
