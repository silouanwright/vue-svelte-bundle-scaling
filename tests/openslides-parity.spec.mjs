import { expect, test } from "@playwright/test";
import { installOpenSlidesBackend } from "./openslides-tauri-mock.mjs";

const implementations = [
  { name: "Vue", url: "http://127.0.0.1:4474" },
  { name: "Svelte", url: "http://127.0.0.1:4475" },
];

async function loadImplementation(page, implementation, options) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await installOpenSlidesBackend(page, options);
  await page.goto(implementation.url);
  return pageErrors;
}

async function openSeededDeck(page) {
  await expect(
    page.getByRole("heading", { name: "Your Presentations" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Benchmark Deck" }).click();
  await expect(page).toHaveURL(/#\/editor\/project-1$/);
  await expect(page.getByRole("button", { name: /Present/ })).toBeVisible();
}

for (const implementation of implementations) {
  test(`${implementation.name} satisfies the dashboard contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation);

    await expect(
      page.getByRole("heading", { name: "Your Presentations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Benchmark Deck" }),
    ).toBeVisible();

    const benchmarkDeck = page.getByRole("button", { name: "Benchmark Deck" });
    await benchmarkDeck.hover();
    await benchmarkDeck
      .getByRole("button", { name: /Duplicate presentation/ })
      .click();
    await expect(
      page.getByRole("button", { name: "Benchmark Deck copy" }),
    ).toBeVisible();

    const duplicate = page.getByRole("button", {
      name: "Benchmark Deck copy",
    });
    await duplicate.hover();
    await duplicate.getByRole("button", { name: "Rename" }).click();
    const renameInput = duplicate.getByRole("textbox", {
      name: "Edit name",
    });
    await renameInput.fill("Renamed Duplicate");
    await renameInput.press("Enter");
    const renamedDuplicate = page.getByRole("button", {
      name: "Renamed Duplicate",
    });
    await expect(renamedDuplicate).toBeVisible();

    await renamedDuplicate.hover();
    await renamedDuplicate
      .getByRole("button", { name: "Delete presentation" })
      .click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(renamedDuplicate).toBeHidden();

    expect(pageErrors.map((error) => error.message), "browser page errors").toEqual(
      [],
    );
  });

  test(`${implementation.name} satisfies the project-stack contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation, {
      stacked: true,
    });
    const stack = page.getByRole("button", {
      name: "Stack of 2 presentations, press Enter to expand",
    });
    await expect(stack).toBeVisible();
    await stack.click();
    await expect(
      page.getByRole("button", { name: "Reference Deck" }).last(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Ungroup all" }).click();
    await expect(stack).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Reference Deck" }),
    ).toBeVisible();

    expect(pageErrors.map((error) => error.message), "browser page errors").toEqual(
      [],
    );
  });

  test(`${implementation.name} satisfies the editor and persistence contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation);
    await openSeededDeck(page);

    await expect(
      page.locator(".shiki-magic-move-container").last(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator(".editor-highlight code span").first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("textarea").first()).toHaveValue(
      "const framework = 'OpenSlides';\nconsole.log(framework);",
    );

    await page.locator("textarea").first().fill(
      "const framework = 'Vue and Svelte';\nconsole.log(framework);",
    );
    await expect(page.locator("textarea").first()).toHaveValue(
      "const framework = 'Vue and Svelte';\nconsole.log(framework);",
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__OPENSLIDES_E2E__.calls.filter(
              (call) => call.command === "update_slide_code",
            ).length,
        ),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        page.evaluate(
          () => window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].code,
        ),
      )
      .toBe("const framework = 'Vue and Svelte';\nconsole.log(framework);");

    await page.getByRole("button", { name: /Find\/Replace/ }).click();
    await page
      .getByRole("textbox", { name: "Find", exact: true })
      .fill("framework");
    await page
      .getByRole("textbox", { name: "Replace", exact: true })
      .fill("platform");
    await page.getByRole("button", { name: "Replace All" }).click();
    await expect(page.locator("textarea").first()).toHaveValue(
      "const platform = 'Vue and Svelte';\nconsole.log(platform);",
    );
    await page.locator("textarea").first().focus();
    await page.keyboard.press("Control+Z");
    await expect(page.locator("textarea").first()).toHaveValue(
      "const framework = 'Vue and Svelte';\nconsole.log(framework);",
    );

    await page.locator('[data-slide-id="project-1-slide-1"]').click({
      button: "right",
    });
    await page
      .getByRole("menu", { name: "Slide actions" })
      .getByRole("button", { name: /^Rename/ })
      .click();
    const slideName = page.getByRole("textbox", {
      name: /Edit name|Slide name/,
    });
    await slideName.fill("Primary Slide");
    await slideName.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(
          () => window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].name,
        ),
      )
      .toBe("Primary Slide");

    const duration = page
      .getByText("Duration", { exact: true })
      .first()
      .locator("..")
      .locator("..")
      .getByRole("slider");
    await duration.focus();
    await duration.press("ArrowRight");
    await expect
      .poll(() =>
        page.evaluate(
          () => window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].duration,
        ),
      )
      .toBeGreaterThan(3000);

    await page.evaluate(() =>
      window.dispatchEvent(new Event("openslides:open-search")),
    );
    const slideSearch = page.getByRole("textbox", {
      name: /Find slides by name or code|Search slide names and code/,
    });
    await slideSearch.fill("Output");
    await expect(page.getByText("Output", { exact: true }).last()).toBeVisible();
    await slideSearch.fill("");
    await slideSearch.press("Escape");
    await page.locator('[data-slide-id="project-1-slide-2"]').click();
    await expect(page.locator("textarea").first()).toHaveValue(
      "export const parity = true;",
    );
    await page.locator('[data-slide-id="project-1-slide-1"]').click();

    await expect(page.locator("[data-slide-id]")).toHaveCount(2);
    await page.locator("[data-slide-id]").first().click({ button: "right" });
    await page.getByRole("menu", { name: "Slide actions" })
      .getByRole("button", { name: "Select multiple" })
      .click();
    await page.locator("[data-slide-id]").nth(1).click();
    const selectionToolbar = page.getByRole("toolbar", {
      name: "Selected slide actions",
    });
    await expect(selectionToolbar).toContainText("2");
    await selectionToolbar
      .getByRole("button", { name: "Group selected" })
      .click();
    const slideStack = page.getByRole("button", {
      name: "Stack of 2, press Enter to expand",
    });
    await expect(slideStack).toBeVisible();
    await slideStack.click();
    await page.getByRole("button", { name: "Ungroup", exact: true }).click();
    await expect(slideStack).toBeHidden();
    await expect(page.locator("[data-slide-id]")).toHaveCount(2);

    await page.getByRole("button", { name: /Add slide/i }).click();
    await expect(page.locator("[data-slide-id]")).toHaveCount(3);

    const outputSlide = page.locator('[data-slide-id="project-1-slide-2"]');
    await outputSlide.hover();
    await outputSlide
      .getByRole("button", { name: /Duplicate slide/ })
      .click();
    await expect(page.locator("[data-slide-id]")).toHaveCount(4);
    const duplicatedSlide = page.locator('[data-slide-id^="slide-"]').last();
    await duplicatedSlide.hover();
    await duplicatedSlide.getByRole("button", { name: "Delete slide" }).click();
    await expect(page.locator("[data-slide-id]")).toHaveCount(3);

    expect(pageErrors.map((error) => error.message), "browser page errors").toEqual(
      [],
    );
  });

  test(`${implementation.name} satisfies the presentation and application-shell contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation);
    await openSeededDeck(page);

    await page.getByRole("button", { name: /Present/ }).click();
    const presentation = page.locator("#openslides-present-root");
    await expect(presentation).toBeVisible();
    await presentation.getByRole("button", { name: /^Play/ }).click();
    const pauseAutoplay = presentation.getByRole("button", { name: /^Pause/ });
    await expect(pauseAutoplay).toBeVisible();
    await pauseAutoplay.click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#openslides-present-root")).toContainText(
      "export const parity",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator("#openslides-present-root")).toBeHidden();

    await page.getByRole("button", { name: "Settings" }).click();
    const settings = page.getByRole("dialog", { name: "Settings" });
    await expect(settings).toBeVisible();
    const layoutTab = settings.getByRole("tab", { name: "Layout" });
    if (await layoutTab.count()) await layoutTab.click();
    const codeAlignment = settings.getByRole("radiogroup", {
      name: "Code alignment",
    });
    await expect(codeAlignment).toBeVisible();
    await codeAlignment.getByText("center", { exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () => window.__OPENSLIDES_E2E__.snapshot()[0].settings.codeAlign,
        ),
      )
      .toBe("center");
    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(settings).toBeHidden();

    await page.keyboard.press("Control+K");
    await expect(page.getByPlaceholder(/Type a command/)).toBeVisible();

    expect(
      pageErrors.map((error) => error.message),
      "browser page errors",
    ).toEqual([]);
  });
}
