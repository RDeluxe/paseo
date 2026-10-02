// FORK(RDeluxe/paseo): sidebar preferences that upstream does not have. See FORK.md.
//
// Kept out of the synced app settings on purpose: those are validated by upstream's
// `hooks/use-settings/storage.ts`, and every field added there is a rebase conflict waiting to
// happen. A local persisted store costs nothing to carry.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { createValidatedPersistStorage } from "@/storage/validated-persist-storage";

export const SIDEBAR_DENSITIES = ["comfortable", "compact"] as const;
export type SidebarDensity = (typeof SIDEBAR_DENSITIES)[number];

/** Workspaces shown per project before "Show more". `null` keeps upstream's limit. */
export const SIDEBAR_WORKSPACE_LIMITS = [3, 5, 10, 20] as const;
export type SidebarWorkspaceLimit = (typeof SIDEBAR_WORKSPACE_LIMITS)[number];

/** Finished workspaces older than this go behind "Show more". 0 turns it off. */
export const SIDEBAR_HIDE_INACTIVE_DAYS = [0, 3, 7, 14, 30] as const;
export type SidebarHideInactiveDays = (typeof SIDEBAR_HIDE_INACTIVE_DAYS)[number];

export interface ForkSidebarPreferences {
  density: SidebarDensity;
  workspaceLimit: SidebarWorkspaceLimit;
  hideInactiveDays: SidebarHideInactiveDays;
}

export const DEFAULT_FORK_SIDEBAR_PREFERENCES: ForkSidebarPreferences = {
  density: "compact",
  workspaceLimit: 5,
  hideInactiveDays: 14,
};

const PersistedSchema: z.ZodType<Partial<ForkSidebarPreferences>> = z.object({
  density: z.enum(SIDEBAR_DENSITIES).optional(),
  workspaceLimit: z
    .number()
    .refine((value): value is SidebarWorkspaceLimit =>
      (SIDEBAR_WORKSPACE_LIMITS as readonly number[]).includes(value),
    )
    .optional(),
  hideInactiveDays: z
    .number()
    .refine((value): value is SidebarHideInactiveDays =>
      (SIDEBAR_HIDE_INACTIVE_DAYS as readonly number[]).includes(value),
    )
    .optional(),
}) as z.ZodType<Partial<ForkSidebarPreferences>>;

interface ForkSidebarPreferencesState extends ForkSidebarPreferences {
  setDensity: (density: SidebarDensity) => void;
  setWorkspaceLimit: (limit: SidebarWorkspaceLimit) => void;
  setHideInactiveDays: (days: SidebarHideInactiveDays) => void;
}

export const useForkSidebarPreferences = create<ForkSidebarPreferencesState>()(
  persist<ForkSidebarPreferencesState, [], [], Partial<ForkSidebarPreferences>>(
    (set) => ({
      ...DEFAULT_FORK_SIDEBAR_PREFERENCES,
      setDensity: (density) => set({ density }),
      setWorkspaceLimit: (workspaceLimit) => set({ workspaceLimit }),
      setHideInactiveDays: (hideInactiveDays) => set({ hideInactiveDays }),
    }),
    {
      name: "fork-sidebar-preferences",
      storage: createValidatedPersistStorage(AsyncStorage, PersistedSchema),
      partialize: ({ density, workspaceLimit, hideInactiveDays }) => ({
        density,
        workspaceLimit,
        hideInactiveDays,
      }),
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
    },
  ),
);

export function useSidebarDensity(): SidebarDensity {
  return useForkSidebarPreferences((state) => state.density);
}
