import { expect, test } from "@playwright/test";

const implementations = [
  { name: "Vue", url: "http://127.0.0.1:4274" },
  { name: "Svelte", url: "http://127.0.0.1:4275" },
];

for (const implementation of implementations) {
  test(`${implementation.name} satisfies the hand-authored behavior contract`, async ({
    page,
  }) => {
    await page.goto(implementation.url);

    await expect(page.getByTestId("view-dashboard")).toBeVisible();
    await page.getByTestId("metric-period").selectOption("month");
    await expect(page.getByTestId("metric-total")).toHaveText("Total 991");
    await page
      .getByLabel("Activity filters")
      .getByRole("button", { name: "import", exact: true })
      .click();
    await expect(page.getByTestId("activity-list").getByRole("listitem")).toHaveCount(1);
    await page.getByLabel("Review queue empty").check();
    await expect(page.getByTestId("health-progress")).toHaveText("3/4 complete");

    await page.getByTestId("route-search").click();
    await expect(page.getByTestId("view-search")).toBeVisible();
    await page.getByTestId("search-query").fill("reader");
    await expect(page.getByRole("heading", { name: "1 results" })).toBeVisible();
    await page.getByLabel("Documents 2").check();
    await page.getByLabel("Notes 1").check();
    await page.getByLabel("Documents 2").uncheck();
    await expect(page.getByTestId("empty-results")).toHaveText("No matching records");

    await page.getByTestId("route-records").click();
    await expect(page.getByTestId("view-records")).toBeVisible();
    await page.getByRole("checkbox").first().check();
    await expect(page.getByTestId("selected-records")).toHaveText("1 selected");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByTestId("page-range")).toContainText("26–50");
    await page.getByLabel("Page count").check();
    await expect(page.getByText("3 shown", { exact: true })).toBeVisible();

    await page.getByTestId("route-reader").click();
    await expect(page.getByTestId("view-reader")).toBeVisible();
    await page.getByRole("button", { name: /Evidence/ }).click();
    await expect(page.getByTestId("reader-section")).toHaveText("Evidence");
    const readerPanel = page
      .getByRole("button", { name: "Increase text size" })
      .locator("xpath=ancestor::article");
    await page.getByRole("button", { name: "Increase text size" }).click();
    await expect(readerPanel).toHaveCSS("font-size", "19px");
    await page.getByLabel("Line width").selectOption("narrow");
    await expect(readerPanel).toHaveCSS("max-width", "576px");
    await page.getByTestId("annotation-note").fill("Useful evidence");
    await page.getByRole("button", { name: "Save annotation" }).click();
    await expect(page.getByTestId("annotation-count")).toHaveText("1 saved");

    await page.getByTestId("route-editor").click();
    await expect(page.getByTestId("view-editor")).toBeVisible();
    await page.getByTestId("editor-body").fill("One two three four");
    await expect(page.getByTestId("word-count")).toHaveText("4 words");
    await expect(page.getByText("Unsaved changes", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save revision" }).click();
    await expect(page.getByText("All changes saved", { exact: true })).toBeVisible();
    await expect(page.getByText("Revision 2", { exact: true })).toBeVisible();
    const revisionFour = page.getByRole("button", { name: /^v4 / });
    await revisionFour.click();
    await expect(revisionFour).toHaveClass(/selected/);
    await page.getByRole("button", { name: "Restore latest" }).click();
    await expect(page.getByRole("button", { name: /^v5 / })).toHaveClass(/selected/);

    await page.getByTestId("route-settings").click();
    await expect(page.getByTestId("view-settings")).toBeVisible();
    await page.getByTestId("profile-name").fill("x");
    await expect(page.getByRole("button", { name: "Save profile" })).toBeDisabled();
    await page.getByTestId("profile-name").fill("Mara Chen");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Profile saved", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "dark" }).click();
    await expect(page.getByTestId("theme-choice")).toHaveText("dark / standard");
    await page.getByLabel("Open search").fill("Alt+K");
    await page.getByRole("button", { name: "Restore defaults" }).click();
    await expect(page.getByLabel("Open search")).toHaveValue("⌘K");

    await page.getByTestId("route-notifications").click();
    await expect(page.getByTestId("view-notifications")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(page.getByTestId("notice-count")).toHaveText("2 notifications");
    await page
      .getByRole("row", { name: /System/ })
      .getByRole("checkbox")
      .first()
      .uncheck();
    await expect(page.getByText("2 active", { exact: true })).toBeVisible();
    await page.getByLabel("Enable schedule").uncheck();
    await expect(page.getByTestId("quiet-summary")).toHaveText(
      "Notifications always allowed",
    );

    await page.getByTestId("route-library").click();
    await expect(page.getByTestId("view-library")).toBeVisible();
    await page.getByTestId("source-query").fill("removable");
    await expect(page.getByRole("button", { name: /Removable Archive/ })).toBeVisible();
    await expect(page.getByTestId("active-imports")).toHaveText("1 active imports");
    const booksCollection = page.getByRole("button", { name: /Books/ });
    await expect(booksCollection).toHaveAttribute("aria-expanded", "false");
    await booksCollection.click();
    await expect(page.getByRole("link", { name: "Primary" })).toBeVisible();
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.getByTestId("active-imports")).toHaveText("2 active imports");
  });
}
