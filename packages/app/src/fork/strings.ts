// FORK(RDeluxe/paseo): the fork's UI copy, outside upstream's locale files so rebases never
// conflict on them. French and English; every other language falls back to English.
import { useTranslation } from "react-i18next";

const en = {
  density: "Density",
  densityComfortable: "Comfortable",
  densityCompact: "Compact",
  workspaceLimit: "Per project",
  workspaceLimitValue: (n: number) => `${n} workspaces`,
  hideInactive: "Hide inactive",
  hideInactiveOff: "Never",
  hideInactiveValue: (n: number) => `After ${n} days`,
  daysShort: (n: number) => `${n}d`,
  more: "More",
  collapseAll: "Collapse all",
  expandAll: "Expand all",
};

const fr: typeof en = {
  density: "Densité",
  densityComfortable: "Confortable",
  densityCompact: "Compacte",
  workspaceLimit: "Par projet",
  workspaceLimitValue: (n) => `${n} workspaces`,
  hideInactive: "Masquer les inactifs",
  hideInactiveOff: "Jamais",
  hideInactiveValue: (n) => `Après ${n} jours`,
  daysShort: (n) => `${n} j`,
  more: "Plus",
  collapseAll: "Tout replier",
  expandAll: "Tout déplier",
};

export type ForkStrings = typeof en;

export function useForkStrings(): ForkStrings {
  const { i18n } = useTranslation();
  return (i18n.language ?? "en").toLowerCase().startsWith("fr") ? fr : en;
}
