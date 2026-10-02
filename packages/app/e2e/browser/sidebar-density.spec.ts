import { test, expect, type Page } from "../support/fixtures";
import { gotoAppShell } from "../support/helpers/app";
import { seedWorkspace } from "../support/helpers/seed-client";
import { getServerId } from "../support/helpers/server-id";
import {
  closeSidebarDisplayPreferences,
  openSidebarDisplayPage,
  selectSidebarDensity,
} from "../support/helpers/sidebar";

function rowHeight(page: Page, workspaceId: string): Promise<number> {
  return page
    .getByTestId(`sidebar-workspace-row-${getServerId()}:${workspaceId}`)
    .evaluate((element) => element.getBoundingClientRect().height);
}

test.describe("Sidebar density", () => {
  test("compact rows are shorter than comfortable ones", async ({ page }) => {
    const workspace = await seedWorkspace({ repoPrefix: "sidebar-density-", title: "Density" });
    try {
      await gotoAppShell(page);
      await expect(
        page.getByTestId(`sidebar-workspace-row-${getServerId()}:${workspace.workspaceId}`),
      ).toBeVisible({ timeout: 30_000 });
      const comfortableHeight = await rowHeight(page, workspace.workspaceId);

      await selectSidebarDensity(page, "compact");

      await expect
        .poll(() => rowHeight(page, workspace.workspaceId))
        .toBeLessThan(comfortableHeight);
    } finally {
      await workspace.cleanup();
    }
  });

  test("compact rows leave out the line under the title", async ({ page }) => {
    const workspace = await seedWorkspace({ repoPrefix: "sidebar-density-", title: "One line" });
    try {
      await gotoAppShell(page);
      const row = page.getByTestId(
        `sidebar-workspace-row-${getServerId()}:${workspace.workspaceId}`,
      );
      await expect(row).toBeVisible({ timeout: 30_000 });
      await openSidebarDisplayPage(page, "sidebar-display-show");
      await page.getByTestId("sidebar-row-item-branch").click();
      await closeSidebarDisplayPreferences(page);
      await expect(row.getByTestId("sidebar-workspace-branch")).toBeVisible();

      await selectSidebarDensity(page, "compact");

      await expect(row.getByTestId("sidebar-workspace-branch")).toHaveCount(0);
    } finally {
      await workspace.cleanup();
    }
  });
});
