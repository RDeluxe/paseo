// FORK(RDeluxe/paseo): end-to-end proof of the fork's sidebar features. See FORK.md.
import { expect, type Page } from "@playwright/test";
import { test } from "../support/fixtures";
import { gotoAppShell } from "../support/helpers/app";
import { seedWorkspace } from "../support/helpers/seed-client";
import { getServerId } from "../support/helpers/server-id";
import { closeSidebarDisplayPreferences, openSidebarDisplayPage } from "../support/helpers/sidebar";

const WORKSPACE_COUNT = 8;

async function chooseForkOption(page: Page, branch: string, option: string): Promise<void> {
  await openSidebarDisplayPage(page, branch);
  await page.getByTestId(option).click();
  if ((await page.getByTestId("sidebar-display-preferences-content").count()) > 0) {
    await closeSidebarDisplayPreferences(page);
  }
}

test.describe("Fork sidebar", () => {
  test.describe.configure({ timeout: 240_000 });

  test("limits workspaces per project, toggles density, collapses and expands all", async ({
    page,
  }, testInfo) => {
    const seeded = await seedWorkspace({ repoPrefix: "fork-sidebar-", title: "Fork 1" });
    const serverId = getServerId();
    const workspaceIds = [seeded.workspaceId];
    try {
      for (let index = 2; index <= WORKSPACE_COUNT; index += 1) {
        const created = await seeded.client.createWorkspace({
          source: { kind: "directory", path: seeded.repoPath, projectId: seeded.projectId },
          title: `Fork ${index}`,
        });
        if (!created.workspace) throw new Error(created.error ?? "workspace not created");
        workspaceIds.push(created.workspace.id);
      }
      const rows = page.locator(
        workspaceIds
          .map((id) => `[data-testid="sidebar-workspace-row-${serverId}:${id}"]`)
          .join(","),
      );
      const showMore = page.locator('[data-testid^="sidebar-project-show-more-"]');

      await gotoAppShell(page);
      await expect(rows.first()).toBeVisible({ timeout: 30_000 });

      // Default: 5 per project, the rest behind "Show more".
      await expect(rows).toHaveCount(5, { timeout: 15_000 });
      await expect(showMore).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("1-limit-5-compact.png") });

      // Compact is the fork default; rows sit well under upstream's 36px minimum.
      const compactHeight = (await rows.first().boundingBox())?.height ?? 0;
      expect(compactHeight).toBeLessThan(32);

      await chooseForkOption(page, "fork-sidebar-density", "fork-sidebar-density-comfortable");
      await expect
        .poll(async () => (await rows.first().boundingBox())?.height ?? 0)
        .toBeGreaterThanOrEqual(36);
      await page.screenshot({ path: testInfo.outputPath("2-comfortable.png") });
      await chooseForkOption(page, "fork-sidebar-density", "fork-sidebar-density-compact");

      // A higher limit shows everything and drops the toggle.
      await chooseForkOption(page, "fork-sidebar-limit", "fork-sidebar-limit-10");
      await expect(rows).toHaveCount(WORKSPACE_COUNT);
      await expect(showMore).toHaveCount(0);
      await chooseForkOption(page, "fork-sidebar-limit", "fork-sidebar-limit-5");
      await expect(rows).toHaveCount(5);

      // "Show more" still reveals the rest.
      await showMore.click();
      await expect(rows).toHaveCount(WORKSPACE_COUNT);
      await showMore.click();
      await expect(rows).toHaveCount(5);

      // Collapse all hides every workspace row; expand all brings them back.
      await page.getByTestId("sidebar-display-preferences-menu").click();
      await page.getByTestId("fork-sidebar-collapse-all").click();
      await expect(rows).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath("3-collapsed.png") });
      await page.getByTestId("sidebar-display-preferences-menu").click();
      await page.getByTestId("fork-sidebar-expand-all").click();
      await expect(rows).toHaveCount(5);

      // Preferences survive a cold load.
      await chooseForkOption(page, "fork-sidebar-limit", "fork-sidebar-limit-3");
      await page.reload();
      await expect(rows.first()).toBeVisible({ timeout: 30_000 });
      await expect(rows).toHaveCount(3);
      await page.getByTestId("sidebar-display-preferences-menu").click();
      await page.screenshot({ path: testInfo.outputPath("4-menu.png") });
    } finally {
      await seeded.cleanup();
    }
  });
});
