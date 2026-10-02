import type { Locator } from "@playwright/test";
import { test, expect, type Page } from "../support/fixtures";
import { gotoAppShell } from "../support/helpers/app";
import { projectEquivalenceViewKey } from "../support/helpers/project-view-key";
import { addProjectWorkspaces, seedWorkspace } from "../support/helpers/seed-client";
import { getServerId } from "../support/helpers/server-id";
import {
  collapseAllSidebarSections,
  expandAllSidebarSections,
  selectSidebarDensity,
  selectSidebarWorkspaceLimit,
} from "../support/helpers/sidebar";

interface SeededProject {
  rows: (page: Page) => Locator;
  moreTestId: string;
  cleanup: () => Promise<void>;
}

/** One project with `count` workspaces, all fresh, so only the limit decides what shows. */
async function seedProject(count: number): Promise<SeededProject> {
  const seeded = await seedWorkspace({ repoPrefix: "sidebar-project-limit-", title: "Limit 0" });
  const added = await addProjectWorkspaces(seeded, { count: count - 1, titlePrefix: "Limit" });
  const workspaceIds = [seeded.workspaceId, ...added];
  const serverId = getServerId();
  const selector = workspaceIds
    .map((id) => `[data-testid="sidebar-workspace-row-${serverId}:${id}"]`)
    .join(",");
  return {
    rows: (page) => page.locator(selector),
    moreTestId: `sidebar-project-show-more-${projectEquivalenceViewKey(seeded.projectKey)}`,
    cleanup: seeded.cleanup,
  };
}

function rowHeight(page: Page, project: SeededProject): Promise<number> {
  return project
    .rows(page)
    .first()
    .evaluate((element) => element.getBoundingClientRect().height);
}

test.describe("Sidebar project limit", () => {
  test.describe.configure({ timeout: 240_000 });

  test("shows five workspaces per project and adds ten per press of More", async ({ page }) => {
    const project = await seedProject(17);
    try {
      await gotoAppShell(page);
      const rows = project.rows(page);
      const more = page.getByTestId(project.moreTestId);

      await expect(rows).toHaveCount(5, { timeout: 30_000 });
      await expect(more).toHaveText("More");

      await more.click();
      await expect(rows).toHaveCount(15);

      await more.click();
      await expect(rows).toHaveCount(17);
      await expect(more).toHaveCount(0);
    } finally {
      await project.cleanup();
    }
  });

  test("a limit above the project's size shows every workspace and no More", async ({ page }) => {
    const project = await seedProject(8);
    try {
      await gotoAppShell(page);
      await expect(project.rows(page)).toHaveCount(5, { timeout: 30_000 });

      await selectSidebarWorkspaceLimit(page, 10);

      await expect(project.rows(page)).toHaveCount(8);
      await expect(page.getByTestId(project.moreTestId)).toHaveCount(0);
    } finally {
      await project.cleanup();
    }
  });

  test("the limit survives a reload", async ({ page }) => {
    const project = await seedProject(5);
    try {
      await gotoAppShell(page);
      await expect(project.rows(page)).toHaveCount(5, { timeout: 30_000 });

      await selectSidebarWorkspaceLimit(page, 3);
      await expect(project.rows(page)).toHaveCount(3);
      await page.reload();

      await expect(project.rows(page).first()).toBeVisible({ timeout: 30_000 });
      await expect(project.rows(page)).toHaveCount(3);
    } finally {
      await project.cleanup();
    }
  });

  test("compact rows are shorter than comfortable ones", async ({ page }) => {
    const project = await seedProject(1);
    try {
      await gotoAppShell(page);
      await expect(project.rows(page)).toHaveCount(1, { timeout: 30_000 });
      const compactHeight = await rowHeight(page, project);

      await selectSidebarDensity(page, "comfortable");

      await expect.poll(() => rowHeight(page, project)).toBeGreaterThan(compactHeight);
    } finally {
      await project.cleanup();
    }
  });

  test("collapse all folds the project and expand all unfolds it", async ({ page }) => {
    const project = await seedProject(2);
    try {
      await gotoAppShell(page);
      await expect(project.rows(page)).toHaveCount(2, { timeout: 30_000 });

      await collapseAllSidebarSections(page);
      await expect(project.rows(page)).toHaveCount(0);

      await expandAllSidebarSections(page);
      await expect(project.rows(page)).toHaveCount(2);
    } finally {
      await project.cleanup();
    }
  });
});
