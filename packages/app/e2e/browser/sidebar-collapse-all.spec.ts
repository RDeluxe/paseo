import { test, expect } from "../support/fixtures";
import { gotoAppShell } from "../support/helpers/app";
import { addProjectWorkspaces, seedWorkspace } from "../support/helpers/seed-client";
import { getServerId } from "../support/helpers/server-id";
import { collapseAllSidebarSections, expandAllSidebarSections } from "../support/helpers/sidebar";

test.describe("Sidebar collapse all", () => {
  test("collapse all folds the project and expand all unfolds it", async ({ page }) => {
    const seeded = await seedWorkspace({ repoPrefix: "sidebar-collapse-all-", title: "Fold 0" });
    try {
      const added = await addProjectWorkspaces(seeded, { count: 1, titlePrefix: "Fold" });
      const rows = page.locator(
        [seeded.workspaceId, ...added]
          .map((id) => `[data-testid="sidebar-workspace-row-${getServerId()}:${id}"]`)
          .join(","),
      );
      await gotoAppShell(page);
      await expect(rows).toHaveCount(2, { timeout: 30_000 });

      await collapseAllSidebarSections(page);
      await expect(rows).toHaveCount(0);

      await expandAllSidebarSections(page);
      await expect(rows).toHaveCount(2);
    } finally {
      await seeded.cleanup();
    }
  });
});
