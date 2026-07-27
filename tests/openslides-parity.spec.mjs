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

  test(`${implementation.name} satisfies the project creation, import, export, and shortcuts contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation);
    await expect(
      page.getByRole("heading", { name: "Your Presentations" }),
    ).toBeVisible();

    const benchmarkDeck = page.getByRole("button", { name: "Benchmark Deck" });
    await benchmarkDeck.hover();
    await benchmarkDeck.getByRole("button", { name: "Export" }).click();
    await expect(page.getByText(/Exported to .*benchmark-deck/)).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__OPENSLIDES_E2E__.calls.filter(
              (call) => call.command === "export_project_to_json",
            ).length,
        ),
      )
      .toBe(1);

    await page.getByRole("button", { name: "Import", exact: true }).click();
    await expect(page).toHaveURL(/#\/editor\/project-\d+$/);
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__OPENSLIDES_E2E__
            .snapshot()
            .some((item) => item.name === "Imported Presentation"),
        ),
      )
      .toBe(true);
    await page
      .getByRole("button", { name: /Back to presentations|Dashboard/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your Presentations" }),
    ).toBeVisible();

    await page.keyboard.press("?");
    const shortcuts = page.getByRole("dialog", {
      name: "Keyboard shortcuts",
    });
    await expect(shortcuts).toBeVisible();
    await expect(shortcuts).toContainText("New presentation");
    await expect(shortcuts).toContainText("Export presentation");
    await page.keyboard.press("Escape");
    await expect(shortcuts).toBeHidden();

    await page
      .getByRole("button", { name: "New Presentation", exact: true })
      .click();
    await page.getByLabel("Presentation Name").fill("Parity Created Deck");
    await page
      .getByRole("button", { name: "Select theme GitHub Light" })
      .click();
    await page
      .getByRole("button", { name: "Create Presentation", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/editor\/project-\d+$/);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const project = window.__OPENSLIDES_E2E__
            .snapshot()
            .find((item) => item.name === "Parity Created Deck");
          return project && { name: project.name, theme: project.theme };
        }),
      )
      .toEqual({ name: "Parity Created Deck", theme: "github-light" });

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

  test(`${implementation.name} satisfies the dashboard virtualization and pointer-stacking contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation, {
      projectCount: 120,
    });
    const heading = page.getByRole("heading", { name: "Your Presentations" });
    await expect(heading).toBeVisible();
    expect(
      await page.getByRole("button", { name: /Generated Deck/ }).count(),
    ).toBeLessThan(40);

    const scrollArea = page
      .locator("div.overflow-auto")
      .filter({ has: heading })
      .first();
    await scrollArea.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      element.dispatchEvent(new Event("scroll"));
    });
    await expect(
      page.getByRole("button", { name: "Generated Deck 120" }),
    ).toBeVisible();

    await scrollArea.evaluate((element) => {
      element.scrollTop = 0;
      element.dispatchEvent(new Event("scroll"));
    });
    const source = page.locator('[data-chunk-id="project-1"]');
    const target = page.locator('[data-chunk-id="project-2"]');
    await expect(source).toBeVisible();
    await expect(target).toBeVisible();
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(targetBox).not.toBeNull();
    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        page.evaluate(() => {
          const projects = window.__OPENSLIDES_E2E__.snapshot();
          return [
            projects.find((item) => item.id === "project-1")?.groupId,
            projects.find((item) => item.id === "project-2")?.groupId,
          ];
        }),
      )
      .toEqual([expect.any(String), expect.any(String)]);
    const groupIds = await page.evaluate(() => {
      const projects = window.__OPENSLIDES_E2E__.snapshot();
      return [
        projects.find((item) => item.id === "project-1")?.groupId,
        projects.find((item) => item.id === "project-2")?.groupId,
      ];
    });
    expect(groupIds[0]).toBe(groupIds[1]);
    await expect(
      page.getByRole("button", {
        name: "Stack of 2 presentations, press Enter to expand",
      }),
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
    let selectionToolbar = page.getByRole("toolbar", {
      name: "Selected slide actions",
    });
    await selectionToolbar
      .getByRole("button", { name: "Move selected to end" })
      .click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__OPENSLIDES_E2E__.snapshot()[0].slides.map((slide) => slide.id),
        ),
      )
      .toEqual(["project-1-slide-2", "project-1-slide-1"]);
    await selectionToolbar
      .getByRole("button", { name: /Cancel selection/ })
      .click();

    await page.locator("[data-slide-id]").first().click({ button: "right" });
    await page.getByRole("menu", { name: "Slide actions" })
      .getByRole("button", { name: "Select multiple" })
      .click();
    await page.locator("[data-slide-id]").nth(1).click();
    selectionToolbar = page.getByRole("toolbar", {
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
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.fullscreenElement !== null ||
            window.__OPENSLIDES_E2E__.calls.some(
              (call) =>
                call.command === "plugin:window|set_fullscreen" &&
                call.args.value === true,
            ),
        ),
      )
      .toBe(true);
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

    await page
      .getByRole("button", { name: "Settings", exact: true })
      .click();
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

    await settings
      .getByRole("switch", { name: "Editor line numbers" })
      .click();
    await settings
      .getByRole("switch", { name: "Slide hover previews" })
      .click();
    await settings
      .getByRole("switch", {
        name: /Slide line numbers|Show line numbers/,
      })
      .click();

    const themeTab = settings.getByRole("tab", { name: "Theme" });
    if (await themeTab.count()) await themeTab.click();
    const themeRadio = settings.getByRole("radio", {
      name: /GitHub Light/,
    });
    if (await themeRadio.count()) await themeRadio.click();
    else
      await settings
        .getByRole("button", { name: /GitHub Light/ })
        .click();

    const motionTab = settings.getByRole("tab", { name: "Motion" });
    if (await motionTab.count()) await motionTab.click();
    await settings
      .getByRole("switch", { name: "Use global transition" })
      .click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const project = window.__OPENSLIDES_E2E__.snapshot()[0];
          return {
            codeAlign: project.settings.codeAlign,
            showLineNumbers: project.settings.showLineNumbers,
            theme: project.theme,
            useGlobalTransition: project.settings.useGlobalTransition,
          };
        }),
      )
      .toEqual({
        codeAlign: "center",
        showLineNumbers: false,
        theme: "github-light",
        useGlobalTransition: true,
      });
    await page.getByRole("button", { name: "Close settings" }).click();
    await expect(settings).toBeHidden();

    await page.locator('[data-slide-id="project-1-slide-2"]').hover();
    await expect(page.locator("[data-slide-hover-preview]")).toHaveCount(1, {
      timeout: 3_000,
    });
    await page.locator("textarea").first().hover();
    await expect(page.locator("[data-slide-hover-preview]")).toHaveCount(0);

    await page.keyboard.press("Control+K");
    await expect(page.getByPlaceholder(/Type a command/)).toBeVisible();

    expect(
      pageErrors.map((error) => error.message),
      "browser page errors",
    ).toEqual([]);
  });

  test(`${implementation.name} satisfies deterministic autoplay progression`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation, {
      autoplayDuration: 100,
    });
    await openSeededDeck(page);
    await page.getByRole("button", { name: /Present/ }).click();
    const presentation = page.locator("#openslides-present-root");
    await presentation.getByRole("button", { name: /^Play/ }).click();
    await expect(presentation).toContainText("export const parity", {
      timeout: 5_000,
    });

    expect(
      pageErrors.map((error) => error.message),
      "browser page errors",
    ).toEqual([]);
  });

  test(`${implementation.name} satisfies the highlight authoring contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation);
    await openSeededDeck(page);

    await page
      .getByRole("button", { name: "Settings", exact: true })
      .click();
    const settings = page.getByRole("dialog", { name: "Settings" });
    const motionTab = settings.getByRole("tab", { name: "Motion" });
    if (await motionTab.count()) await motionTab.click();
    await settings
      .getByRole("switch", { name: "Use global highlight" })
      .click();
    await page.getByRole("button", { name: "Close settings" }).click();

    const initialRow = page.locator('[data-highlight-id="highlight-1"]');
    await initialRow.locator("[data-highlight-select]").click();
    const highlightSettings = page.locator("[data-highlight-settings]");
    await expect(highlightSettings).toBeVisible();
    const dimSlider = highlightSettings
      .locator('input[type="range"], [role="slider"]')
      .first();
    await dimSlider.focus();
    await dimSlider.press("ArrowRight");
    await highlightSettings.locator('[role="switch"]').nth(0).click();
    await highlightSettings.locator('[role="switch"]').nth(1).click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const highlight =
            window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].highlights[0];
          return {
            dimAmount: highlight.dimAmount,
            sizeUpEnabled: highlight.sizeUpEnabled,
            useCustomTransition: highlight.useCustomTransition,
          };
        }),
      )
      .toEqual({
        dimAmount: expect.any(Number),
        sizeUpEnabled: true,
        useCustomTransition: true,
      });
    expect(
      await page.evaluate(
        () =>
          window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].highlights[0]
            .dimAmount,
      ),
    ).toBeGreaterThan(75);

    const previewButton = initialRow.getByRole("button", {
      name: "Preview highlight",
    });
    if (await previewButton.count()) await previewButton.click();
    await expect(page.locator("[data-highlight-dim-effect]").first()).toBeVisible({
      timeout: 5_000,
    });
    await expect(
      page.locator("[data-highlight-scale-effect]").first(),
    ).toBeVisible({ timeout: 5_000 });

    const editor = page.locator("textarea").first();
    if (implementation.name === "Svelte") {
      await page.getByTitle("Toggle highlight mode").click();
    }
    await editor.evaluate((element) => {
      element.focus();
      element.setSelectionRange(36, 43);
      element.dispatchEvent(new Event("select", { bubbles: true }));
    });
    if (implementation.name === "Svelte") {
      await editor.evaluate((element) => {
        element.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: 420,
            clientY: 360,
          }),
        );
      });
      await page
        .getByRole("menu", { name: "Highlight actions" })
        .getByRole("button", { name: "Add Highlight" })
        .click();
    } else {
      await page.getByRole("button", { name: "Add", exact: true }).click();
    }
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].highlights.length,
        ),
      )
      .toBe(2);

    const newHighlightId = await page.evaluate(
      () =>
        window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].highlights[1].id,
    );
    await initialRow.getByRole("button", { name: "Move highlight down" }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].highlights[0].id,
        ),
      )
      .toBe(newHighlightId);

    const newHighlightRow = page.locator(
      `[data-highlight-id="${newHighlightId}"]`,
    );
    await newHighlightRow
      .getByRole("button", { name: "Delete highlight" })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__OPENSLIDES_E2E__.snapshot()[0].slides[0].highlights.length,
        ),
      )
      .toBe(1);

    expect(
      pageErrors.map((error) => error.message),
      "browser page errors",
    ).toEqual([]);
  });

  test(`${implementation.name} satisfies the native-menu and quit-save contract`, async ({
    page,
  }) => {
    const pageErrors = await loadImplementation(page, implementation);
    await expect(
      page.getByRole("heading", { name: "Your Presentations" }),
    ).toBeVisible();

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://new-project"),
    );
    await expect(page.getByLabel("Presentation Name")).toBeVisible();

    await page.goto(implementation.url);
    await openSeededDeck(page);

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://settings"),
    );
    const settings = page.getByRole("dialog", { name: "Settings" });
    await expect(settings).toBeVisible();
    await page.getByRole("button", { name: "Close settings" }).click();

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://shortcuts-help"),
    );
    await expect(
      page.getByRole("dialog", { name: "Keyboard shortcuts" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://command-palette"),
    );
    await expect(page.getByPlaceholder(/Type a command/)).toBeVisible();
    await page.keyboard.press("Escape");

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://zen"),
    );
    await expect(page.getByRole("button", { name: "Exit Focus (Esc)" })).toBeVisible();
    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://zen"),
    );
    await expect(page.getByRole("button", { name: "Exit Focus (Esc)" })).toBeHidden();

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://add-slide"),
    );
    await expect(page.locator("[data-slide-id]")).toHaveCount(3);
    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://duplicate-slide"),
    );
    await expect(page.locator("[data-slide-id]")).toHaveCount(4);

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("menu://present"),
    );
    await expect(page.locator("#openslides-present-root")).toBeVisible();
    await page.keyboard.press("Escape");

    await page.evaluate(() =>
      window.__OPENSLIDES_E2E__.emit("app://quit-request"),
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__OPENSLIDES_E2E__.calls.filter(
              (call) => call.command === "finish_quit",
            ).length,
        ),
      )
      .toBe(1);

    expect(
      pageErrors.map((error) => error.message),
      "browser page errors",
    ).toEqual([]);
  });
}
