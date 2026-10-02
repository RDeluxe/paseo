import { test, expect } from "../support/fixtures";
import { gotoAppShell } from "../support/helpers/app";
import { projectEquivalenceViewKey } from "../support/helpers/project-view-key";
import { seedWorkspace } from "../support/helpers/seed-client";
import { getServerId } from "../support/helpers/server-id";
import { selectSidebarProjectIcon } from "../support/helpers/sidebar";

test.describe("Sidebar project icon", () => {
  test("a folder leads each project, open while it is expanded", async ({ page }) => {
    const workspace = await seedWorkspace({ repoPrefix: "sidebar-project-icon-", title: "Icon" });
    try {
      await gotoAppShell(page);
      await expect(
        page.getByTestId(`sidebar-workspace-row-${getServerId()}:${workspace.workspaceId}`),
      ).toBeVisible({ timeout: 30_000 });
      const projectRow = page.getByTestId(
        `sidebar-project-row-${projectEquivalenceViewKey(workspace.projectKey)}`,
      );

      await selectSidebarProjectIcon(page, "folder");
      await expect(projectRow.getByTestId("project-folder-open")).toBeVisible();

      await projectRow.click();
      await expect(projectRow.getByTestId("project-folder-closed")).toBeVisible();
    } finally {
      await workspace.cleanup();
    }
  });
});
